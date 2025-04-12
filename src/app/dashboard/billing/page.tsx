"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Check, CreditCard, Calendar, ChevronRight, Shield, Gem, Star, Zap, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

export default function BillingPage() {
  const { subscription, isPro, isEnterprise, refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string>(subscription.plan);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Update selected plan when subscription changes
  useEffect(() => {
    setSelectedPlan(subscription.plan);
  }, [subscription.plan]);
  
  // Create a memoized refresh function with useCallback
  const refreshData = useCallback(async () => {
    if (!hasRefreshed) {
      await refreshSubscription();
      setHasRefreshed(true);
    }
  }, [refreshSubscription, hasRefreshed]);
  
  // Consolidate refresh calls and use state to manage refresh logic
  useEffect(() => {
    const canceled = searchParams.get('canceled');
    const success = searchParams.get('success');
    
    if ((canceled === 'true' || success === 'true') && !hasRefreshed) {
      refreshData();
      setShowSuccessMessage(success === 'true');
    }

    if (success === 'true') {
      // Auto-hide the success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, refreshData, hasRefreshed]);
  
  // Reset the hasRefreshed state when the searchParams change
  useEffect(() => {
    setHasRefreshed(false);
  }, [searchParams.toString()]);
  
  // Plan details
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      interval: "forever",
      description: "Basic features with demo access",
      features: [
        "Access to boilerplate demo",
        "Basic components preview",
        "Limited feature exploration",
        "View-only documentation"
      ],
      cta: "Current Plan",
      disabled: subscription.plan === "free",
      current: subscription.plan === "free"
    },
    {
      id: "pro",
      name: "Pro",
      price: "$20",
      interval: "month",
      description: "Full access to the SaaS boilerplate",
      features: [
        "Complete boilerplate access",
        "Full source code download",
        "All UI components & templates",
        "Authentication system",
        "Database integration",
        "API routes & documentation"
      ],
      cta: subscription.plan === "pro" ? "Current Plan" : "Upgrade to Pro",
      disabled: subscription.plan === "pro",
      current: subscription.plan === "pro",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$100",
      interval: "month",
      description: "Premium features with advanced integrations",
      features: [
        "All Pro features",
        "Custom branding options",
        "Extended API access",
        "White label solution",
        "Priority support & updates",
        "SSO authentication"
      ],
      cta: subscription.plan === "enterprise" ? "Current Plan" : "Upgrade to Enterprise",
      disabled: subscription.plan === "enterprise", 
      current: subscription.plan === "enterprise"
    }
  ];
  
  // Handle plan selection and upgrade
  const handlePlanSelect = async (plan: 'free' | 'pro' | 'enterprise') => {
    try {
      setIsLoading(true);
      setSelectedPlan(plan);
      
      // If switching to free plan, handle differently
      if (plan === 'free' && subscription.plan !== 'free') {
        // Call the cancel subscription endpoint which will downgrade to free
        const response = await fetch('/api/user/subscription/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to downgrade to free plan');
        }
        
        // Close modal if open
        setShowCancelModal(false);
        
        // Use router.push instead of window.location.href to avoid full page reload
        router.push('/dashboard/billing?canceled=true');
        setHasRefreshed(false);
        
        return;
      }
      
      // For paid plans, properly handle Stripe checkout redirect
      const response = await fetch(`/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to create checkout session');
      }
      
      const { sessionId, url } = await response.json();
      
      // If we have a direct URL, use it
      if (url) {
        window.location.href = url;
      } 
      // Otherwise, redirect to Stripe checkout directly
      else if (sessionId) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message);
        }
      } else {
        throw new Error('No URL or session ID returned from checkout API');
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };
  
  const getButtonClass = (plan: 'free' | 'pro' | 'enterprise') => {
    if (plan === selectedPlan) {
      return "w-full py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-glow-cyan-strong cursor-default";
    }
    
    return plan === selectedPlan
      ? "w-full py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all"
      : "w-full py-2 border border-[#0ff0fc]/30 rounded-md hover:bg-[#0ff0fc]/10 hover:text-[#0ff0fc] transition-all";
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Make API call to cancel subscription
      const response = await fetch('/api/user/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Get the response data (even if there's an error, try to parse it)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to cancel subscription');
      }
      
      // Close modal
      setShowCancelModal(false);
      
      // Reset refresh state to enable a new refresh
      setHasRefreshed(false);
      
      // Redirect to billing page with success parameter
      router.push('/dashboard/billing?canceled=true');
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      
      // Show a more user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription. Please try again or contact support.';
      alert(errorMessage);
      
      // Try to refresh the subscription data anyway
      setHasRefreshed(false);
      refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 md:px-0 pb-12">
      {/* Current Subscription Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Billing & Subscription
          </span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400">Manage your subscription and payment details</p>
      </div>
      
      {/* Current Plan Summary */}
      <Card className="bg-gradient-to-r from-[#0c1a29] to-[#1a1033] border border-[#0ff0fc]/20">
        <CardHeader>
          <CardTitle className="text-glow-cyan-strong text-xl sm:text-2xl">Current Subscription</CardTitle>
          <CardDescription>Your active subscription and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0 w-full md:w-auto">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center mr-3 flex-shrink-0">
                  {subscription.plan === 'free' && <Star className="h-5 w-5 text-[#0ff0fc]" />}
                  {subscription.plan === 'pro' && <Gem className="h-5 w-5 text-[#0ff0fc]" />}
                  {subscription.plan === 'enterprise' && <Shield className="h-5 w-5 text-[#0ff0fc]" />}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {subscription.plan === 'free' && "Free Plan"}
                    {subscription.plan === 'pro' && "Pro Plan"}
                    {subscription.plan === 'enterprise' && "Enterprise Plan"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {subscription.plan === 'free' && "Limited features, ideal for trying out our services"}
                    {subscription.plan === 'pro' && "Full access to premium features for serious users"}
                    {subscription.plan === 'enterprise' && "Complete solution with priority support and advanced features"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a1018] px-4 py-3 rounded-md border border-[#0ff0fc]/10 w-full md:w-auto">
              <div className="text-sm text-gray-400 mb-1">Current billing cycle</div>
              <div className="text-white font-medium flex items-center text-xs sm:text-sm">
                <Calendar className="h-4 w-4 mr-2 text-[#0ff0fc] flex-shrink-0" />
                <span className="truncate">
                  {subscription.plan === 'free' ? "N/A - Free Plan" : "November 15, 2023 - December 15, 2023"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Feature Usage */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#0a1018] p-4 rounded-md border border-[#0ff0fc]/10">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Homework Solves</h4>
              <div className="text-xl sm:text-2xl font-semibold text-white mb-1">
                {subscription.plan === 'free' ? "2/2" : "Unlimited"}
                <span className="text-xs text-gray-400 ml-1">
                  {subscription.plan === 'free' ? "daily" : ""}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {subscription.plan === 'free' ? "Resets at midnight" : "Full access with your plan"}
              </div>
            </div>
            
            <div className="bg-[#0a1018] p-4 rounded-md border border-[#0ff0fc]/10">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Essay Generation</h4>
              <div className="text-xl sm:text-2xl font-semibold text-white mb-1">
                {subscription.plan === 'free' ? "2/2" : "Unlimited"}
                <span className="text-xs text-gray-400 ml-1">
                  {subscription.plan === 'free' ? "daily" : ""}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {subscription.plan === 'free' ? "Resets at midnight" : "Full access with your plan"}
              </div>
            </div>
            
            <div className="bg-[#0a1018] p-4 rounded-md border border-[#0ff0fc]/10 sm:col-span-2 md:col-span-1">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Word Limit</h4>
              <div className="text-xl sm:text-2xl font-semibold text-white mb-1">
                {subscription.plan === 'free' ? "750" : subscription.plan === 'pro' ? "2000" : "Unlimited"}
                <span className="text-xs text-gray-400 ml-1">words</span>
              </div>
              <div className="text-xs text-gray-500">
                {subscription.plan === 'free' ? "Per document" : "Higher limits with your plan"}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 pb-4">
          {subscription.plan !== 'free' && (
            <button 
              className="px-4 py-2 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md text-sm transition-all flex items-center justify-center w-full sm:w-auto"
              onClick={() => setShowCancelModal(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              Cancel Subscription
            </button>
          )}
          {subscription.plan !== 'enterprise' && (
            <Link
              href="#plans"
              className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center justify-center w-full sm:w-auto"
            >
              <Zap className="h-4 w-4 mr-2" />
              {subscription.plan === 'free' ? "Upgrade Plan" : "Change Plan"}
            </Link>
          )}
        </CardFooter>
      </Card>
      
      {/* Updated Payment History */}
      <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Payment History</CardTitle>
          <CardDescription>View your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.plan === 'free' ? (
            <div className="text-center py-8 bg-[#0a1018] rounded-md border border-[#0ff0fc]/10">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-500">No payment history available for Free plans</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto rounded-md border border-[#0ff0fc]/10">
              {/* For mobile, use a card layout instead of table */}
              <div className="sm:hidden space-y-4 p-4">
                <div className="bg-[#0a1018] rounded-md p-4 border border-[#0ff0fc]/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Invoice</span>
                    <span>INV-{Math.floor(Math.random() * 10000)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Amount</span>
                    <span>{subscription.plan === 'pro' ? '$9.99' : '$29.99'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Plan</span>
                    <span>{subscription.plan === 'pro' ? 'Pro' : 'Enterprise'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Status</span>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Paid</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#0ff0fc]/10 text-center">
                    <button className="text-[#0ff0fc] hover:underline text-xs">
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
              
              {/* For larger screens, keep the table */}
              <table className="w-full text-sm text-left hidden sm:table">
                <thead className="bg-[#0a1018] text-xs text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#0ff0fc]/10 bg-[#0a1018]">
                    <td className="px-4 py-3">INV-{Math.floor(Math.random() * 10000)}</td>
                    <td className="px-4 py-3">{new Date().toLocaleDateString()}</td>
                    <td className="px-4 py-3">{subscription.plan === 'pro' ? '$9.99' : '$29.99'}</td>
                    <td className="px-4 py-3">
                      {subscription.plan === 'pro' ? 'Pro' : 'Enterprise'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                        Paid
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#0ff0fc] hover:underline text-xs">
                        Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment Method */}
      <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Payment Method</CardTitle>
          <CardDescription>Manage your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.plan !== 'free' ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
                <div className="w-10 h-10 bg-[#0a1018] rounded-md border border-[#0ff0fc]/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-[#0ff0fc]" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Visa ending in 4242</h3>
                  <p className="text-xs text-gray-400">Expires 12/2025</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="px-3 py-1.5 border border-[#0ff0fc]/30 rounded text-xs hover:bg-[#0ff0fc]/10 transition-all flex-1 md:flex-auto">
                  Update
                </button>
                <button className="px-3 py-1.5 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/10 transition-all flex-1 md:flex-auto">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-[#0a1018] rounded-md border border-[#0ff0fc]/10">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-500 mb-4">No payment method available</p>
              <button className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all inline-flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Available Plans */}
      <div id="plans" className="pt-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-glow-cyan-strong">Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1/2 bg-[#0ff0fc]/30 text-glow-cyan-strong px-3 py-1 rounded-full text-xs font-medium border border-[#0ff0fc]">
                  POPULAR
                </div>
              )}
              <Card 
                className={`p-4 sm:p-6 ${
                  plan.name.toLowerCase() === selectedPlan 
                    ? 'border-[#0ff0fc] bg-[#0ff0fc]/5' 
                    : 'bg-[#0c1a29] border-[#0ff0fc]/20 hover:border-[#0ff0fc]/50'
                } transition-all duration-200`}
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    {plan.name === 'Free' && <Star className="h-5 w-5 mr-2 text-[#0ff0fc]" />}
                    {plan.name === 'Pro' && <Gem className="h-5 w-5 mr-2 text-[#0ff0fc]" />}
                    {plan.name === 'Enterprise' && <Shield className="h-5 w-5 mr-2 text-[#0ff0fc]" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-xl sm:text-2xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1 text-sm">{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-4 w-4 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-3 sm:pt-4">
                  <button
                    onClick={() => handlePlanSelect(plan.name.toLowerCase() as 'free' | 'pro' | 'enterprise')}
                    className={getButtonClass(plan.name.toLowerCase() as 'free' | 'pro' | 'enterprise')}
                    disabled={isLoading || plan.name.toLowerCase() === subscription.plan}
                  >
                    {isLoading && selectedPlan === plan.name.toLowerCase() ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {plan.name.toLowerCase() === subscription.plan
                      ? 'Current Plan'
                      : `Upgrade to ${plan.name}`}
                  </button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Checkout Button - Only show if user selected a different plan */}
        {selectedPlan !== subscription.plan && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => handlePlanSelect(selectedPlan as 'free' | 'pro' | 'enterprise')}
              className="px-6 sm:px-8 py-3 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all inline-flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                  <ChevronRight className="h-5 w-5 ml-1" />
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              You'll be charged {selectedPlan === 'pro' ? "$9.99" : "$29.99"} when you confirm your subscription.
            </p>
          </div>
        )}
      </div>
      
      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1a29] border border-[#0ff0fc]/30 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Cancel Subscription</h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to cancel your subscription? You'll lose access to premium features and your plan will be downgraded to Free.
            </p>
            <div className="flex flex-col space-y-2 mb-4">
              <div className="p-3 bg-[#0a1018] rounded border border-[#0ff0fc]/10">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center mr-3 flex-shrink-0">
                    {subscription.plan === 'pro' && <Gem className="h-4 w-4 text-[#0ff0fc]" />}
                    {subscription.plan === 'enterprise' && <Shield className="h-4 w-4 text-[#0ff0fc]" />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {subscription.plan === 'pro' ? "Pro Plan" : "Enterprise Plan"}
                    </h4>
                    <p className="text-xs text-gray-400">
                      Your current subscription
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3">
                <ChevronRight className="h-4 w-4 text-gray-500 mx-auto" />
              </div>

              <div className="p-3 bg-[#0a1018] rounded border border-[#0ff0fc]/10">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star className="h-4 w-4 text-[#0ff0fc]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Free Plan</h4>
                    <p className="text-xs text-gray-400">
                      Limited features
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                className="px-4 py-2 border border-[#0ff0fc]/30 rounded text-sm hover:bg-[#0ff0fc]/10 transition-all w-full sm:w-auto"
                onClick={() => setShowCancelModal(false)}
                disabled={isLoading}
              >
                Keep Subscription
              </button>
              <button 
                className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 rounded text-sm transition-all flex items-center justify-center w-full sm:w-auto"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 