'use client';

import { useState, useEffect } from 'react';
import { Bell, Zap, Check, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

type DashboardHeaderProps = {
  onOpenSidebar: () => void;
};

const DashboardHeader = ({ onOpenSidebar }: DashboardHeaderProps) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(true);

  // Fetch user's subscription plan
  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            setUserPlan(data.subscription.plan);
          }
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPlan();
  }, []);

  return (
    <header className="sticky top-0 bg-[#0c1a29]/90 backdrop-blur-md border-b border-[#0ff0fc]/10 p-4 flex items-center justify-between z-20 w-full">
      {/* Left side - Mobile menu button and title */}
      <div className="flex items-center">
        <button 
          className="md:hidden mr-4 p-1 rounded-md hover:bg-[#0ff0fc]/10 text-[#0ff0fc]"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div className="text-glow-cyan font-medium hidden sm:block">
          {/* Optional title or breadcrumbs */}
        </div>
      </div>
      
      {/* Right side actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Upgrade Button (shown only for free plan) */}
        {userPlan === 'free' ? (
          <Link 
            href="/dashboard/billing" 
            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong rounded-full transition-all hover:bg-[#0ff0fc]/30 hover:scale-105 text-xs sm:text-sm font-medium flex items-center"
          >
            <Zap size={16} className="mr-1.5" />
            <span className="hidden sm:inline">Upgrade Now</span>
            <span className="sm:hidden">Upgrade</span>
          </Link>
        ) : (
          <div className="hidden sm:flex px-4 py-2 border border-[#0ff0fc]/20 text-[#0ff0fc]/80 rounded-full text-sm font-medium items-center">
            <Check size={16} className="mr-1.5" />
            {userPlan === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-[#0ff0fc]/10 relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={20} className="text-[#0ff0fc]/80" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0c1a29] border border-[#0ff0fc]/20 rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-[#0ff0fc]/10">
                <h3 className="font-medium text-[#0ff0fc]">Notifications</h3>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                <div className="p-2 hover:bg-[#0ff0fc]/5 rounded-md cursor-pointer">
                  <p className="text-sm">New message from Alex</p>
                  <p className="text-xs text-[#0ff0fc]/60">2 minutes ago</p>
                </div>
                <div className="p-2 hover:bg-[#0ff0fc]/5 rounded-md cursor-pointer">
                  <p className="text-sm">Your subscription was renewed</p>
                  <p className="text-xs text-[#0ff0fc]/60">Yesterday</p>
                </div>
              </div>
              <div className="p-2 border-t border-[#0ff0fc]/10">
                <button className="text-[#0ff0fc] text-sm hover:text-glow-cyan w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out button */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-2 sm:px-4 py-1.5 sm:py-2 border border-[#0ff0fc]/30 hover:border-[#0ff0fc]/70 hover:bg-[#0ff0fc]/10 rounded-full text-xs sm:text-sm font-medium transition-all hover:text-glow-cyan"
        >
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Exit</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader; 