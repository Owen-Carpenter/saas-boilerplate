'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/context/SubscriptionContext';
import { Loader2, CheckCircle, RefreshCw } from 'lucide-react';

// Define the types to match what's in SubscriptionContext
type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export default function SuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Processing your subscription...");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSubscription, setSubscription } = useSubscription();
  
  // Process the subscription update only once when the component mounts
  useEffect(() => {
    let isUnmounted = false;
    
    const processPayment = async () => {
      try {
        // Get the session ID from URL
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('Missing session ID');
        }

        // Get plan from URL or use a default
        const planFromUrl = searchParams.get('plan');
        const selectedPlan = planFromUrl || 'pro'; // Default to pro if not specified
        
        console.log('Processing payment for session:', sessionId, 'Plan:', selectedPlan);
        
        // Try to directly update the subscription in the database
        try {
          const response = await fetch('/api/user/subscription/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan: selectedPlan,
              sessionId
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Subscription update successful:', data);
            
            if (data.subscription) {
              // Update the subscription in context
              setSubscription(data.subscription);
              
              if (!isUnmounted) {
                setMessage(`Successfully upgraded to ${selectedPlan.toUpperCase()} plan!`);
                setIsLoading(false);
                
                // Redirect to billing page after a short delay
                setTimeout(() => {
                  router.push('/dashboard/billing?success=true');
                }, 2000);
              }
              return;
            }
          } else {
            console.error('Failed to update subscription:', await response.text());
            throw new Error('Failed to update subscription status');
          }
        } catch (err) {
          console.error('Error in update API call:', err);
          
          // If direct update fails, try refreshing from server
          await refreshSubscription();
          
          if (!isUnmounted) {
            setMessage(`Subscription processed. Redirecting to your account...`);
            setIsLoading(false);
            
            // Redirect to billing page after a short delay
            setTimeout(() => {
              router.push('/dashboard/billing?success=true');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        if (!isUnmounted) {
          setError(error instanceof Error ? error.message : 'An unexpected error occurred');
          setIsLoading(false);
        }
      }
    };
    
    processPayment();
    
    // Clean up function to avoid updating state after unmount
    return () => {
      isUnmounted = true;
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Handle manual refresh button click
  const handleManualRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get session ID and plan from URL
      const sessionId = searchParams.get('session_id');
      const planFromUrl = searchParams.get('plan') || 'pro';
      
      if (sessionId) {
        // Try direct update with the API
        const response = await fetch('/api/user/subscription/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: planFromUrl,
            sessionId
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Manual update successful:', data);
          
          if (data.subscription) {
            setSubscription(data.subscription);
            setMessage(`Successfully upgraded to ${planFromUrl.toUpperCase()} plan!`);
            
            setTimeout(() => {
              router.push('/dashboard/billing?success=true');
            }, 2000);
            return;
          }
        }
      }
      
      // If direct update fails, fall back to refresh
      await refreshSubscription();
      setMessage(`Subscription refreshed. Redirecting to your account...`);
      
      setTimeout(() => {
        router.push('/dashboard/billing?success=true');
      }, 2000);
    } catch (e) {
      console.error('Manual refresh error:', e);
      setError('Failed to refresh subscription. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-[#0c1a29] border border-[#0ff0fc]/30 rounded-lg p-8 w-full max-w-md text-center">
        {isLoading ? (
          <>
            <Loader2 className="h-16 w-16 text-[#0ff0fc] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Processing Your Subscription</h2>
            <p className="text-gray-400 mb-4">
              Please wait while we confirm your payment and activate your subscription...
            </p>
            <div className="w-full bg-[#0a1018] rounded-md p-3 border border-[#0ff0fc]/10">
              <div className="w-full bg-[#0a1018] h-2 rounded-full overflow-hidden border border-[#0ff0fc]/20">
                <div className="h-full bg-[#0ff0fc] animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">This may take a few moments...</p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">×</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Subscription Update Issue</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleManualRefresh}
                className="w-full py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan hover:bg-[#0ff0fc]/30 transition-all flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Subscription Status
              </button>
              <button
                onClick={() => router.push('/dashboard/billing')}
                className="w-full py-2 border border-[#0ff0fc]/30 rounded-md text-sm hover:bg-[#0ff0fc]/10 transition-all"
              >
                Return to Billing
              </button>
            </div>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-[#0ff0fc] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="w-full bg-[#0a1018] rounded-md p-4 border border-[#0ff0fc]/10 mb-6">
              <div className="pulse-cyan w-full h-1 bg-[#0ff0fc]/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#0ff0fc] animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Redirecting to your account...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 