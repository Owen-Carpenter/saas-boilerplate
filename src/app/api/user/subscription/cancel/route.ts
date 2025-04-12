import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import Stripe from 'stripe';
import { revalidatePath } from 'next/cache';
import { generateUuidFromEmail } from '@/lib/utils';
import { sendSubscriptionCanceledEmail } from '@/lib/email';

// Function to get plan details for emails
function getPlanDetails(planName: string) {
  const planDetails = {
    'free': { name: 'Free Plan' },
    'pro': { name: 'Pro Plan' },
    'enterprise': { name: 'Enterprise Plan' }
  };
  
  return planDetails[planName as keyof typeof planDetails] || { name: 'Unknown Plan' };
}

export async function POST() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Debug session data
    console.log('Session data in cancel route:', JSON.stringify({
      id: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name,
      session: !!session
    }, null, 2));
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No user identifier found' },
        { status: 401 }
      );
    }

    // Create server client
    const supabase = createServerClient();
    
    // Get user ID from session or generate from email
    const userId = session.user.id || generateUuidFromEmail(session.user.email);
    console.log('Processing cancellation for user ID:', userId);
    
    // First, check if there's a subscription record for this user
    const { data: userSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, plan, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .single();
    
    // If no subscription found for this user ID, try email as fallback
    if (subError) {
      console.log('No subscription found with user ID, trying email fallback');
      
      const { data: emailSubscription, error: emailError } = await supabase
        .from('user_subscriptions')
        .select('id, user_id, plan, stripe_customer_id, stripe_subscription_id')
        .eq('user_id', session.user.email)
        .single();
      
      if (emailError) {
        console.error('No subscription found by ID or email:', emailError);
        return NextResponse.json(
          { error: 'No subscription found for this user' },
          { status: 404 }
        );
      }
      
      // Use the email-based subscription
      console.log('Found subscription using email');
      const previousPlan = emailSubscription.plan;
      
      // Update the user's plan to free
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.email);
      
      if (updateError) {
        console.error('Error updating subscription by email:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
      
      // Send cancellation email
      if (session.user.email) {
        try {
          const { name } = getPlanDetails(previousPlan);
          
          await sendSubscriptionCanceledEmail({
            to: session.user.email,
            userName: session.user.name || 'User',
            planName: name
          });
          
          console.log(`Sent cancellation email to ${session.user.email}`);
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError);
          // Continue with the process even if email fails
        }
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Subscription canceled successfully',
          timestamp: Date.now()
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate'
          }
        }
      );
    }
    
    // Store the previous plan for email
    const previousPlan = userSubscription.plan;
    
    // Cancel the Stripe subscription if it exists
    if (userSubscription.stripe_subscription_id) {
      try {
        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2023-10-16' as any
        });
        
        console.log('Cancelling Stripe subscription:', userSubscription.stripe_subscription_id);
        
        // Try to cancel the subscription
        await stripe.subscriptions.cancel(userSubscription.stripe_subscription_id);
        console.log('Successfully cancelled Stripe subscription');
      } catch (stripeError) {
        // Log the error but continue with database update
        console.error('Error cancelling Stripe subscription (continuing anyway):', stripeError);
      }
    }
    
    // Update plan in database (even if Stripe cancellation failed)
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription', details: updateError },
        { status: 500 }
      );
    }
    
    console.log('Successfully updated subscription to free plan');
    
    // Send cancellation email
    if (session.user.email) {
      try {
        const { name } = getPlanDetails(previousPlan);
        
        await sendSubscriptionCanceledEmail({
          to: session.user.email,
          userName: session.user.name || 'User',
          planName: name
        });
        
        console.log(`Sent cancellation email to ${session.user.email}`);
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Continue with the process even if email fails
      }
    }
    
    // Attempt to revalidate paths
    try {
      revalidatePath('/dashboard/billing');
      revalidatePath('/api/user/subscription');
    } catch (e) {
      console.error('Error revalidating paths:', e);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Subscription canceled successfully',
        timestamp: Date.now()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
    
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
} 