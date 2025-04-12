import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createServerClient } from '@/lib/supabase';
import { generateUuidFromEmail } from '@/lib/utils';
import { authOptions } from '@/lib/auth';
import { sendSubscriptionReceiptEmail } from '@/lib/email';

// Function to get plan details for emails
function getPlanDetails(planName: string) {
  const planDetails = {
    'free': { name: 'Free Plan', amount: '$0.00' },
    'pro': { name: 'Pro Plan', amount: '$9.99' },
    'enterprise': { name: 'Enterprise Plan', amount: '$29.99' }
  };
  
  return planDetails[planName as keyof typeof planDetails] || { name: 'Unknown Plan', amount: '$0.00' };
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { plan, sessionId } = body;
    
    console.log('Updating subscription directly:', { plan, sessionId });
    
    // Validate plan
    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }
    
    // Initialize the Supabase client
    const supabase = createServerClient();
    
    // Get the user's session
    const session = await getServerSession(authOptions);
    console.log('Session in update API:', JSON.stringify({
      id: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name,
      hasSession: !!session
    }, null, 2));
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user ID from session or generate a UUID from email
    const userId = session.user.id || generateUuidFromEmail(session.user.email);
    console.log('Using userId for subscription update:', userId);
    
    // Current time for timestamps
    const timestamp = new Date().getTime();
    const now = new Date().toISOString();
    
    // Set expiration date (30 days from now)
    const currentPeriodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    
    // Generate a customer ID if needed
    let customerId = sessionId ? `cus_${sessionId.substring(0, 10)}` : `cus_${userId.substring(0, 10)}`;
    
    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', userId)
      .single();
    
    // If they already have a customer ID, use it
    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    }
    
    // Before the error check, initialize updatedSubscription as an empty array
    let updatedSubscription: any[] = [];

    // Update the subscription in the database
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan: plan,
        status: 'active',
        current_period_end: currentPeriodEnd,
        updated_at: now,
        stripe_customer_id: customerId,
        // If session ID is provided, use it as subscription ID
        stripe_subscription_id: sessionId || null,
      }, { onConflict: 'user_id' })
      .select();

    // Assign the result to our variable if it's not null
    if (data) {
      updatedSubscription = data;
    }
    
    if (error) {
      console.error('Error updating subscription directly:', error);
      
      // Try a direct update if upsert fails
      try {
        const { data: updateResult, error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            plan: plan,
            status: 'active',
            current_period_end: currentPeriodEnd,
            updated_at: now,
          })
          .eq('user_id', userId)
          .select();
          
        if (updateError) {
          console.error('Fallback update also failed:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }
        
        console.log('Successfully updated subscription with fallback method:', updateResult);
        updatedSubscription[0] = updateResult[0];
      } catch (fallbackError) {
        console.error('Fallback update error:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    }
    
    console.log('Successfully updated subscription directly:', updatedSubscription);
    
    // Send receipt email after successful subscription update
    try {
      const { name, amount } = getPlanDetails(plan);
      
      await sendSubscriptionReceiptEmail({
        to: session.user.email,
        userName: session.user.name || 'User',
        planName: name,
        amount: amount,
        invoiceId: `INV-${Math.floor(Math.random() * 100000)}`,
      });
      
      console.log(`Sent subscription receipt email to ${session.user.email}`);
    } catch (emailError) {
      console.error('Error sending subscription receipt email:', emailError);
      // Continue with the process even if email fails
    }
    
    // Create a subscription object for the frontend
    const subscriptionForClient = {
      id: updatedSubscription?.[0]?.id || 0,
      user_id: userId,
      plan: plan,
      status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: sessionId || null,
      current_period_end: currentPeriodEnd,
      created_at: updatedSubscription?.[0]?.created_at || now,
      updated_at: now
    };
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated to ${plan} plan`,
      subscription: subscriptionForClient
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in subscription update API:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription update' },
      { status: 500 }
    );
  }
} 