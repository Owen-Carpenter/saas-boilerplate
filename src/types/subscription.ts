export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';

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

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end?: number;
  isCanceled?: boolean;
  renewalDate?: string;
}

// Plan feature definitions
export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    maxProjects: 3,
    storage: '500MB',
    support: 'Community',
    api: false,
    advancedAuth: false,
  },
  pro: {
    name: 'Pro',
    maxProjects: Infinity,
    storage: '10GB',
    support: 'Priority Email',
    api: true,
    advancedAuth: true,
  },
  enterprise: {
    name: 'Enterprise',
    maxProjects: Infinity,
    storage: '100GB',
    support: '24/7 Phone & Email',
    api: true,
    advancedAuth: true,
    customIntegrations: true,
    dedicatedAccount: true,
  }
}; 