import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { generateUuidFromEmail } from '@/lib/utils';
import { sendSubscriptionReceiptEmail, sendSubscriptionCanceledEmail } from '@/lib/email';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// Webhook secret for verifying signatures
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Function to get plan details
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
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    // Verify the webhook signature
    try {
      if (!webhookSecret) {
        console.warn('STRIPE_WEBHOOK_SECRET is not set, skipping signature verification');
        event = JSON.parse(body) as Stripe.Event;
      } else {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      }
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle specific event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Webhook received checkout.session.completed event', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status,
        metadata: session.metadata
      });
      
      // Extract metadata from the session
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (!userId || !plan) {
        console.error('Missing userId or plan in session metadata', {
          userId,
          plan,
          sessionId: session.id
        });
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      console.log(`Processing completed checkout for user ${userId}, plan: ${plan}`);

      // Verify payment status
      if (session.payment_status !== 'paid') {
        console.error(`Payment not completed. Status: ${session.payment_status}`);
        return NextResponse.json({ 
          error: 'Payment not completed',
          status: session.payment_status
        }, { status: 400 });
      }

      // Update user's subscription in the database
      try {
        // First check if user exists in the database
        const { data: existingUser, error: userError } = await supabase
          .from('user_subscriptions')
          .select('user_id, plan')
          .eq('user_id', userId)
          .single();
          
        console.log('Existing user check:', { existingUser, error: userError });
        
        // Include a unique timestamp to ensure the update is recognized
        const currentTime = new Date().toISOString();
        const timestamp = new Date().getTime();
        
        // Update or insert the subscription
        const { data: updatedSubscription, error } = await supabase
          .from('user_subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: plan,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'active',
              current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
              updated_at: currentTime,
              last_updated: timestamp, // Add timestamp to ensure update is recognized
            },
            { onConflict: 'user_id' }
          )
          .select();

        if (error) {
          console.error('Error updating subscription in database:', error);
          
          // Try fallback approach with email
          if (error.code === '22P02' && session.customer_email) {
            console.log('Attempting fallback with customer email:', session.customer_email);
            
            const { error: emailError } = await supabase
              .from('user_subscriptions')
              .upsert(
                {
                  user_id: session.customer_email,
                  plan: plan,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: session.subscription as string,
                  status: 'active',
                  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
              );
              
            if (emailError) {
              console.error('Fallback update failed:', emailError);
              return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }
            
            console.log(`Successfully updated subscription using email fallback`);
            
            // Send receipt email after successful subscription update
            if (session.customer_email) {
              const { name, amount } = getPlanDetails(plan);
              
              await sendSubscriptionReceiptEmail({
                to: session.customer_email,
                userName: session.customer_details?.name || 'User',
                planName: name,
                amount: amount,
                invoiceId: `INV-${Math.floor(Math.random() * 100000)}`,
              });
              
              console.log(`Sent subscription receipt email to ${session.customer_email}`);
            }
            
            return NextResponse.json({ success: true, plan });
          }
          
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        console.log(`Successfully updated subscription for user ${userId} to ${plan}`, updatedSubscription);
        
        // Send receipt email after successful subscription update
        if (session.customer_email) {
          const { name, amount } = getPlanDetails(plan);
          
          await sendSubscriptionReceiptEmail({
            to: session.customer_email,
            userName: session.customer_details?.name || 'User',
            planName: name,
            amount: amount,
            invoiceId: `INV-${Math.floor(Math.random() * 100000)}`,
          });
          
          console.log(`Sent subscription receipt email to ${session.customer_email}`);
        }
        
        return NextResponse.json({ success: true, plan });
      } catch (error) {
        console.error('Error processing subscription update:', error);
        return NextResponse.json({ error: 'Subscription processing error' }, { status: 500 });
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Get the customer ID
      const customerId = subscription.customer as string;
      
      // Look up the user by Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();
      
      if (userError || !userData) {
        console.error('Error finding user for customer:', customerId, userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Get the price ID to determine the plan
      const priceId = subscription.items.data[0].price.id;
      
      // Map the price ID to a plan name
      let plan = 'free';
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        plan = 'pro';
      } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
        plan = 'enterprise';
      }
      
      // Update the subscription status
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan: plan,
          status: subscription.status,
          current_period_end: (subscription as any).current_period_end,
          updated_at: new Date().toISOString(),
          last_updated: new Date().getTime() // Add timestamp for reliable updates
        })
        .eq('user_id', userData.user_id);
      
      if (error) {
        console.error('Error updating subscription status:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      
      console.log(`Updated subscription for user ${userData.user_id} to ${plan}`);
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Look up the user by Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan')
        .eq('stripe_customer_id', customerId)
        .single();
      
      if (userError || !userData) {
        console.error('Error finding user for customer:', customerId, userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Get the user's email from Stripe customer
      const customer = await stripe.customers.retrieve(customerId as string) as Stripe.Customer;
      const userEmail = customer.email;
      const previousPlan = userData.plan;
      
      // Update the subscription to free plan
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          updated_at: new Date().toISOString(),
          last_updated: new Date().getTime() // Add timestamp for reliable updates
        })
        .eq('user_id', userData.user_id);
      
      if (error) {
        console.error('Error canceling subscription:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      
      console.log(`Canceled subscription for user ${userData.user_id}`);
      
      // Send cancellation email
      if (userEmail) {
        const { name } = getPlanDetails(previousPlan);
        
        await sendSubscriptionCanceledEmail({
          to: userEmail,
          userName: (customer as Stripe.Customer).name || 'User',
          planName: name
        });
        
        console.log(`Sent subscription cancellation email to ${userEmail}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 