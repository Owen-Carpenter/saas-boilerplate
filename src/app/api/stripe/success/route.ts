import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { createServerClient } from '@/lib/supabase';
import { generateUuidFromEmail } from '@/lib/utils';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

/**
 * API route handler for processing successful Stripe checkout sessions
 * This serves as a backup for the webhook in case it fails
 */
export async function GET(request: Request) {
  try {
    // Get the session_id from the URL
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Get user session for authentication
    const userSession = await getServerSession();
    console.log('Session:', JSON.stringify(userSession, null, 2));
    
    if (!userSession?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try to get user ID from different session properties
    let userId = userSession?.user?.id;
    
    // If ID is not directly available, generate from email
    if (!userId && userSession?.user?.email) {
      userId = generateUuidFromEmail(userSession.user.email);
      console.log('Generated userId from email:', userId);
    }
    
    // If still no userId, check if it's in the stripe checkout session
    if (!userId) {
      // Retrieve the checkout session from Stripe to get user ID from metadata
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      userId = stripeSession.metadata?.userId;
      console.log('Using userId from Stripe metadata:', userId);
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session or Stripe metadata' },
        { status: 404 }
      );
    }

    // Initialize the Supabase client
    const supabase = createServerClient();

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Check if the session is paid
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Extract the plan from metadata
    const plan = session.metadata?.plan;
    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Check if we already processed this session (to avoid duplicates)
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get the subscription data from Stripe if available
    let currentPeriodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days by default
    let subscriptionStatus = 'active';
    
    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        // Use type assertion to access current_period_end
        currentPeriodEnd = (subscription as any).current_period_end;
        subscriptionStatus = subscription.status;
      } catch (error) {
        console.error('Error retrieving subscription details:', error);
      }
    }

    // Update the user's subscription in the database
    try {
      const timestamp = new Date().getTime(); // Add unique timestamp to ensure update is recognized
      
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(
          {
            user_id: userId,
            plan: plan,
            status: subscriptionStatus,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
            last_updated: timestamp,
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error updating subscription:', error);
        
        // If it's a UUID format error, try using the Stripe customer ID as the user_id
        if (error.code === '22P02' && error.message.includes('invalid input syntax for type uuid')) {
          console.log('Attempting to use Stripe customer ID as fallback user_id');
          
          const { error: fallbackError } = await supabase
            .from('user_subscriptions')
            .upsert(
              {
                user_id: session.customer as string, // Use Stripe customer ID as user_id
                plan: plan,
                status: subscriptionStatus,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_end: currentPeriodEnd,
                updated_at: new Date().toISOString(),
                last_updated: timestamp,
              },
              { onConflict: 'user_id' }
            );
            
          if (fallbackError) {
            console.error('Fallback subscription update also failed:', fallbackError);
            return NextResponse.json(
              { error: 'Failed to update subscription with fallback ID' },
              { status: 500 }
            );
          }
          
          console.log('Successfully used Stripe customer ID as user_id');
        } else {
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }
      }
      
      // Force a delay to ensure database changes are propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the update was successful by retrieving the updated subscription
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying subscription update:', verifyError);
        return NextResponse.json(
          { error: 'Failed to verify subscription update' },
          { status: 500 }
        );
      }
      
      if (verifyData.plan !== plan) {
        console.error(`Verification failed - plan is still ${verifyData.plan} instead of ${plan}`);
        return NextResponse.json(
          { error: 'Plan was not updated correctly' },
          { status: 500 }
        );
      }
      
      console.log('Verified subscription data:', verifyData);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Success response
    
    // Check if we need to redirect
    const redirectUrl = url.searchParams.get('redirect');
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL));
    }
    
    // Get the latest subscription data to return
    const { data: finalSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated to ${plan} plan`,
      subscription: {
        plan,
        status: subscriptionStatus,
        currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
        data: finalSubscription || null
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error processing success:', error);
    return NextResponse.json(
      { error: 'Failed to process successful payment' },
      { status: 500 }
    );
  }
} 