import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getSession } from 'next-auth/react';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface UserSubscription {
  id: number;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Updates a user's subscription in the database
 */
export async function updateUserSubscription({
  userId,
  plan,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  currentPeriodEnd
}: {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
}) {
  const supabase = createClientComponentClient();

  try {
    // Check if user already has a subscription record
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan,
          status,
          stripe_customer_id: stripeCustomerId || existingSubscription.stripe_customer_id,
          stripe_subscription_id: stripeSubscriptionId || existingSubscription.stripe_subscription_id,
          current_period_end: currentPeriodEnd || existingSubscription.current_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Insert new subscription
      const { error } = await supabase.from('user_subscriptions').insert({
        user_id: userId,
        plan,
        status,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        current_period_end: currentPeriodEnd
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return { success: false, error };
  }
}

/**
 * Fetches a user's subscription from the database
 */
export async function getUserSubscription(userId?: string): Promise<{
  subscription?: UserSubscription;
  error?: any;
}> {
  try {
    // If no userId provided, try to get the current user
    if (!userId) {
      const session = await getSession();
      if (!session || !session.user?.email) {
        return { error: 'User not authenticated' };
      }
      // Since we don't have the user ID directly from the session,
      // we need to query for it using the email
      const supabase = createClientComponentClient();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();
        
      if (userError || !userData) {
        return { error: 'User not found' };
      }
      
      userId = userData.id;
    }

    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If error is not found, create a default free subscription
      if (error.code === 'PGRST116') {
        // Create a default subscription record
        await updateUserSubscription({
          userId,
          plan: 'free',
          status: 'active'
        });
        
        // Fetch the newly created subscription
        const { data: newData, error: newError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (newError) throw newError;
        return { subscription: newData as UserSubscription };
      } else {
        throw error;
      }
    }

    return { subscription: data as UserSubscription };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { error };
  }
}

/**
 * Check if a user's subscription is active
 */
export async function isSubscriptionActive(userId?: string): Promise<boolean> {
  const { subscription, error } = await getUserSubscription(userId);
  if (error || !subscription) return false;
  
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const isPro = subscription.plan === 'pro' || subscription.plan === 'enterprise';
  
  return isActive && isPro;
}

/**
 * Get the features available for a subscription plan
 */
export function getPlanFeatures(plan: SubscriptionPlan) {
  const features = {
    free: {
      name: 'Free',
      price: '$0',
      description: 'Basic features for personal use',
      features: [
        '3 homework solves per day',
        '5 AI chat messages per day',
        'Basic boilerplate templates',
        'Community support'
      ]
    },
    pro: {
      name: 'Pro',
      price: '$9.99',
      description: 'Advanced features for power users',
      features: [
        'Unlimited homework solves',
        'Unlimited AI chat messages',
        'Advanced boilerplate templates',
        'Priority support',
        'Export solutions to PDF',
        'Access to premium content'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: '$49.99',
      description: 'Complete solution for teams',
      features: [
        'All Pro features',
        'Team management',
        'API access',
        'Custom branding',
        'Dedicated support',
        'Advanced analytics'
      ]
    }
  };
  
  return features[plan];
} 