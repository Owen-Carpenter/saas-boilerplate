'use client';

import React from 'react';
import { Check, X, Lock } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import Link from 'next/link';

interface PlanFeatureProps {
  feature: string;
  availableOn: ('free' | 'pro' | 'enterprise')[];
  showUpgradeLink?: boolean;
}

export const PlanFeature: React.FC<PlanFeatureProps> = ({ 
  feature, 
  availableOn,
  showUpgradeLink = true 
}) => {
  const { subscription } = useSubscription();
  const isAvailable = availableOn.includes(subscription.plan);
  
  return (
    <div className={`flex items-center py-2 ${!isAvailable ? 'opacity-60' : ''}`}>
      {isAvailable ? (
        <Check className="h-5 w-5 text-[#0ff0fc] mr-2 flex-shrink-0" />
      ) : (
        <Lock className="h-5 w-5 text-[#0ff0fc]/50 mr-2 flex-shrink-0" />
      )}
      <span className={`text-sm ${isAvailable ? 'text-white' : 'text-gray-400'}`}>
        {feature}
      </span>
      
      {!isAvailable && showUpgradeLink && (
        <Link 
          href="/dashboard/billing" 
          className="ml-2 text-xs text-[#0ff0fc] hover:text-glow-cyan transition-all"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
};

interface ProFeatureProps {
  children: React.ReactNode;
  enterpriseOnly?: boolean;
  showUpgradeLink?: boolean;
}

export const ProFeature: React.FC<ProFeatureProps> = ({ 
  children,
  enterpriseOnly = false,
  showUpgradeLink = true 
}) => {
  const { subscription, isPro, isEnterprise } = useSubscription();
  const isAvailable = enterpriseOnly ? isEnterprise : isPro;
  const requiredPlan = enterpriseOnly ? 'enterprise' : 'pro';
  
  if (isAvailable) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-[#0c1a29]/70 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
        <div className="text-center p-4">
          <Lock className="h-8 w-8 text-[#0ff0fc]/50 mx-auto mb-2" />
          <p className="text-sm text-white mb-2">
            This feature requires {requiredPlan === 'pro' ? 'Pro' : 'Enterprise'} plan
          </p>
          {showUpgradeLink && (
            <Link 
              href="/dashboard/billing" 
              className="inline-block px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-[#0ff0fc] rounded-full text-sm hover:bg-[#0ff0fc]/30 transition-all"
            >
              Upgrade Now
            </Link>
          )}
        </div>
      </div>
      <div className="opacity-20 pointer-events-none">
        {children}
      </div>
    </div>
  );
}; 