import { createClient } from '@supabase/supabase-js';
import { getSession } from 'next-auth/react';
import { SubscriptionPlan, SubscriptionStatus, UserSubscription } from '@/types/subscription';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for subscription management
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

// Log environment variable status (redacting the actual values for security)
console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

// Validate URL to prevent "Invalid URL" error
const isValidUrl = (url: string) => {
  try {
    if (!url) return false;
    // Just checking if it's a valid URL format
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Create client only if we have valid credentials
const createSupabaseClient = () => {
  if (!isValidUrl(supabaseUrl)) {
    console.error('Invalid Supabase URL. Please check your environment variables.');
    console.log('URL validation failed for Supabase URL');
    
    // Return a mock client for development to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock Supabase client in development mode');
      return {
        auth: {
          signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          signOut: () => Promise.resolve({ error: null }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('Supabase mock: Database not configured') })
            }),
            count: () => Promise.resolve({ count: 0, error: null })
          }),
          upsert: () => Promise.resolve({ error: null })
        })
      } as any;
    }
  }
  
  if (!supabaseAnonKey) {
    console.error('Missing Supabase Anon Key. Please check your environment variables.');
  }
  
  try {
    console.log('Creating Supabase client with URL', supabaseUrl.substring(0, 10) + '...');
    const client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client created successfully');
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    
    // Return a mock client on error
    console.log('Using mock Supabase client due to client creation error');
    return {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase client creation failed') }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase client creation failed') }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Supabase error: Client creation failed') })
          }),
          count: () => Promise.resolve({ count: 0, error: null })
        }),
        upsert: () => Promise.resolve({ error: null })
      })
    } as any;
  }
};

// Create supabase client
export const supabaseClient = createSupabaseClient();

// For server components
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get user subscription
 */
export async function getUserSubscription(userId?: string) {
  if (!userId) {
    const session = await getSession();
    if (!session?.user?.email) {
      return { plan: 'free', status: 'active' };
    }
    
    // Get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();
      
    if (userError || !userData) {
      return { plan: 'free', status: 'active' };
    }
    
    userId = userData.id;
  }
  
  // Get the subscription
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    return { plan: 'free', status: 'active' };
  }
  
  return data;
}

/**
 * Update user subscription
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
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
}) {
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

// Export the function to make it available to other files
export async function updateUserPlan(plan: SubscriptionPlan) {
  try {
    console.log('Updating user plan to:', plan);
    
    // Get the current user's session
    const session = await getSession();
    
    if (!session?.user?.id) {
      console.error('User not authenticated in updateUserPlan');
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    console.log('Updating plan for user ID:', userId);
    
    // Check if Supabase client is properly initialized
    if (!supabase || !supabase.from) {
      console.error('Supabase client is not properly initialized in updateUserPlan');
      throw new Error('Database connection error');
    }
    
    // Test the connection before attempting update
    try {
      const { error: pingError } = await supabase.from('user_subscriptions').select('count', { count: 'exact', head: true });
      if (pingError) {
        console.error('Supabase connection test failed in updateUserPlan:', pingError);
        throw new Error('Database connection error');
      }
    } catch (pingErr) {
      console.error('Failed to ping Supabase in updateUserPlan:', pingErr);
      throw new Error('Database connection error');
    }
    
    // Update the user's subscription plan
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan: plan, // 'free', 'pro', or 'enterprise'
        status: 'active' as SubscriptionStatus,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        updated_at: new Date().toISOString()
      }, 
      { onConflict: 'user_id' });
      
    if (error) {
      console.error('Error updating subscription in updateUserPlan:', error);
      throw error;
    }
    
    console.log('Successfully updated user plan to:', plan);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateUserPlan:', error);
    throw error; // Re-throw so the calling code can handle it
  }
}

// Function to get the current user plan
export async function getUserPlan(userId: string): Promise<{ 
  plan: SubscriptionPlan; 
  status: SubscriptionStatus;
  current_period_end?: number;
}> {
  if (!userId) {
    console.error('User ID is required for getUserPlan');
    return { plan: 'free', status: 'active' };
  }
  
  try {
    console.log('Fetching plan for user:', userId);
    
    // Check if Supabase client is properly initialized
    if (!supabase || !supabase.from) {
      console.error('Supabase client is not properly initialized');
      return { plan: 'free', status: 'active' };
    }
    
    // Test the connection before attempting query
    try {
      const { error: pingError } = await supabase.from('user_subscriptions').select('count', { count: 'exact', head: true });
      if (pingError) {
        console.error('Supabase connection test failed:', pingError);
        return { plan: 'free', status: 'active' };
      }
    } catch (pingErr) {
      console.error('Failed to ping Supabase:', pingErr);
      return { plan: 'free', status: 'active' };
    }
    
    // Proceed with actual query
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', userId)
      .single();
    
    console.log('Supabase query response:', { data, error });
    
    if (error) {
      // If the error is "not found", it's likely the user doesn't have a subscription yet
      if (error.code === 'PGRST116') {
        console.log('No subscription found for user, defaulting to free plan');
        return { plan: 'free', status: 'active' };
      }
      
      console.error('Error fetching user subscription:', error);
      return { plan: 'free', status: 'active' }; // Default to free plan if there's an error
    }
    
    if (!data) {
      console.log('No data returned from query, defaulting to free plan');
      return { plan: 'free', status: 'active' }; // Default to free plan if no subscription found
    }
    
    // Check if subscription has expired
    const now = Math.floor(Date.now() / 1000);
    if (data.status === 'active' && data.current_period_end < now) {
      console.log('Subscription expired, updating to free plan');
      // Subscription has expired, update to free plan
      try {
        await updateUserPlan('free');
      } catch (updateError) {
        console.error('Error updating expired plan to free:', updateError);
      }
      return { plan: 'free', status: 'active' };
    }
    
    console.log('Returning user plan:', data.plan);
    return { 
      plan: (data.plan || 'free') as SubscriptionPlan,
      status: (data.status || 'active') as SubscriptionStatus,
      current_period_end: data.current_period_end
    };
  } catch (error) {
    console.error('Unexpected error in getUserPlan:', error);
    return { plan: 'free', status: 'active' }; // Default to free plan on error
  }
} 