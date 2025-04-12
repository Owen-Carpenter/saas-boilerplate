import { loadStripe } from '@stripe/stripe-js';
import { getSession } from 'next-auth/react';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

/**
 * Redirects to Stripe Checkout for the specified plan
 * Handles authentication bottleneck - redirects to login if user is not authenticated
 * If user is already authenticated, they are redirected directly to the dashboard
 * 
 * @param plan - The subscription plan: 'free', 'pro', or 'enterprise'
 * @param redirectToDashboard - Whether to redirect directly to dashboard for logged-in users
 * @returns Promise resolving to the redirect result
 */
export async function redirectToCheckout(
  plan: 'free' | 'pro' | 'enterprise', 
  redirectToDashboard: boolean = false
) {
  try {
    // Check if user is logged in
    const session = await getSession();
    
    // If not logged in, redirect to login page with redirect parameter
    if (!session) {
      const callbackUrl = encodeURIComponent(`/dashboard/billing?plan=${plan}`);
      window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`;
      return { success: true, redirectedToLogin: true };
    }
    
    // If user is logged in and redirectToDashboard is true, go directly to dashboard
    if (redirectToDashboard && session) {
      window.location.href = '/dashboard';
      return { success: true, redirectedToDashboard: true };
    }
    
    // User is logged in, proceed with Stripe checkout
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    const { url, error, sessionId } = await response.json();

    if (error) {
      throw new Error(error);
    }

    // Free tier doesn't need Stripe, redirect to the dashboard
    if (plan === 'free') {
      window.location.href = url;
      return { success: true };
    }

    // For paid plans with Stripe
    if (url) {
      window.location.href = url;
      return { success: true, sessionId };
    } else {
      // Handle direct checkout using loadStripe
      const stripe = await stripePromise;
      if (!stripe || !sessionId) {
        throw new Error('Failed to load Stripe.js or missing session ID');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message || 'An unknown error occurred');
      }
      
      return { success: true, sessionId };
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 