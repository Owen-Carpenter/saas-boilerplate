'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define subscription types
type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// Subscription interface
interface UserSubscription {
  id?: number;
  user_id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: number;
  created_at?: string;
  updated_at?: string;
  startDate?: string;
  endDate?: string | null;
}

// Context interface
interface SubscriptionContextType {
  subscription: UserSubscription;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  isPro: boolean;
  isEnterprise: boolean;
  setSubscription: (subscription: UserSubscription) => void;
}

// Create the context with a default value
const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: { plan: 'free', status: 'active' },
  loading: false,
  error: null,
  refreshSubscription: async () => {},
  isPro: false,
  isEnterprise: false,
  setSubscription: () => {}
});

// Create a hook to use the context
export const useSubscription = () => useContext(SubscriptionContext);

// Create the provider component
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription>({ plan: 'free', status: 'active' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to fetch subscription data
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add cache-busting timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/user/subscription?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      // Get the response data even if it's an error
      const data = await response.json();
      
      // Handle 401 errors specially - use the default subscription from the response
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Not authenticated, using default subscription:', data.subscription);
          // Use the default subscription sent in the 401 response
          if (data.subscription) {
            setSubscription(data.subscription);
            return;
          }
          
          // Set default if no subscription in response
          setSubscription({ plan: 'free', status: 'active' });
          throw new Error('Authentication required. Please sign in.');
        }
        throw new Error('Failed to fetch subscription');
      }
      
      console.log('Subscription data fetched:', data);
      
      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Ensure we always have at least a default subscription
      if (subscription.plan === undefined) {
        setSubscription({ plan: 'free', status: 'active' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription on initial load and when refreshCounter changes
  useEffect(() => {
    fetchSubscription();
  }, [refreshCounter]);

  // Enhanced refresh function that updates the counter to trigger a re-fetch
  const refreshSubscription = async () => {
    await fetchSubscription();
    // Increment counter to ensure we can force multiple refreshes if needed
    setRefreshCounter(prev => prev + 1);
  };

  // Computed properties
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';
  const isEnterprise = subscription?.plan === 'enterprise';

  // Value for the context
  const value = {
    subscription,
    loading,
    error,
    refreshSubscription,
    isPro,
    isEnterprise,
    setSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 