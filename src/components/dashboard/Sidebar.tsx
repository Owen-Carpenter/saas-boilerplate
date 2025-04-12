'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, memo } from 'react';
import { useSession } from 'next-auth/react';
import * as LucideIcons from 'lucide-react';

// Subscription plan type
type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(true);
  
  // Destructure needed icons to prevent HMR issues
  const { 
    LayoutDashboard, 
    Settings, 
    User, 
    CreditCard,
    ChevronDown,
    HelpCircle,
    BookOpen,
    MessageSquare,
    Code,
    Star,
    Zap,
    Sparkles,
    Lock
  } = LucideIcons;

  // Fetch user's subscription
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          if (data.subscription && data.subscription.plan) {
            setUserPlan(data.subscription.plan);
          }
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscription();
  }, []);

  // Define menu items - we'll update this dynamically after we know the userPlan
  const initialMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Product Page 1', path: '/dashboard/product-1', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Product Page 2', path: '/dashboard/product-2', icon: <MessageSquare className="w-5 h-5" /> },
    { 
      name: 'Boilerplate', 
      path: '/dashboard/product-3', 
      icon: <Code className="w-5 h-5" />,
      premium: true,
      demoAccess: false // Will be updated based on userPlan
    },
  ];

  // Create the actual menu items based on the user's plan
  const menuItems = initialMenuItems.map(item => {
    if (item.name === 'Boilerplate') {
      return {
        ...item,
        demoAccess: userPlan === 'free'
      };
    }
    return item;
  });

  const profileMenu = [
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: <User size={20} />,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings size={20} />,
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: <CreditCard size={20} />,
    },
    {
      title: 'Help',
      href: '/dashboard/help',
      icon: <HelpCircle size={20} />,
    },
  ];
  
  // Add check if the current path matches any profile menu item
  const isProfileItemActive = profileMenu.some(item => pathname === item.href);
  
  // If a profile item is active, auto-expand the profile menu
  useEffect(() => {
    if (isProfileItemActive && !isProfileOpen) {
      setIsProfileOpen(true);
    }
  }, [pathname, isProfileItemActive, isProfileOpen]);

  // Get the plan icon
  const getPlanIcon = () => {
    switch(userPlan) {
      case 'pro':
        return <Star size={16} className="text-[#0ff0fc] mr-1" />;
      case 'enterprise':
        return <Sparkles size={16} className="text-[#0ff0fc] mr-1" />;
      default:
        return <Zap size={16} className="text-[#0ff0fc] mr-1" />;
    }
  };

  // Get the plan display name
  const getPlanName = () => {
    switch(userPlan) {
      case 'pro':
        return 'Pro Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return 'Free Plan';
    }
  };

  // Handle clicking on a navigation item on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
    
      {/* Sidebar */}
      <div 
        className={`fixed h-screen w-64 bg-[#0c1a29] border-r border-[#0ff0fc]/10 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#0ff0fc]/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-glow-cyan-strong">SaaS</span>
            <span className="text-2xl font-bold ml-1 text-white">Boilerplate</span>
          </Link>
          <button 
            className="text-gray-400 hover:text-white md:hidden" 
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <p className="text-xs text-[#0ff0fc]/70 font-medium mb-3 uppercase tracking-wider">Main</p>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                        pathname === item.path 
                          ? 'bg-[#0ff0fc]/10 text-glow-cyan border border-[#0ff0fc]/30' 
                          : item.demoAccess 
                            ? 'hover:bg-[#0ff0fc]/5 text-gray-300 hover:text-[#0ff0fc]' 
                            : 'hover:bg-[#0ff0fc]/5 text-gray-300 hover:text-[#0ff0fc]'
                      }`}
                      onClick={handleNavClick}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                      {item.demoAccess && (
                        <span className="ml-auto">
                          <div className="bg-gray-700/50 text-gray-300 text-xs px-1.5 py-0.5 rounded-full border border-gray-600/50">
                            DEMO
                          </div>
                        </span>
                      )}
                      {(!item.demoAccess && item.premium) && (
                        <span className="ml-auto">
                          <div className="bg-[#0ff0fc]/20 text-[#0ff0fc] text-xs px-1.5 py-0.5 rounded-full border border-[#0ff0fc]/30">
                            PRO
                          </div>
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* User Profile Section - Fixed at bottom */}
          <div className="p-4 border-t border-[#0ff0fc]/10 relative z-20 bg-[#0c1a29]">
            <button
              className={`w-full flex items-center justify-between p-2 rounded-md transition-all ${
                isProfileOpen || isProfileItemActive 
                  ? 'bg-[#0ff0fc]/10 text-[#0ff0fc]' 
                  : 'hover:bg-[#0ff0fc]/5 text-white hover:text-[#0ff0fc]'
              }`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 mr-3 flex items-center justify-center">
                  <User size={16} className="text-[#0ff0fc]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {session?.user?.name || 'User'}
                  </p>
                  <div className="flex items-center text-xs text-[#0ff0fc]/70">
                    {getPlanIcon()}
                    <span className="truncate max-w-[100px]">{getPlanName()}</span>
                  </div>
                </div>
              </div>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 text-[#0ff0fc] ${isProfileOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isProfileOpen && (
              <div className="mt-2 border-t border-[#0ff0fc]/10 pt-2 bg-[#0c1a29] rounded-md shadow-lg">
                <ul className="space-y-1">
                  {profileMenu.map((item) => (
                    <li key={item.href}>
                      <Link 
                        href={item.href} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                          pathname === item.href 
                            ? 'bg-[#0ff0fc]/10 text-glow-cyan border border-[#0ff0fc]/30' 
                            : 'hover:bg-[#0ff0fc]/5 text-gray-300 hover:text-[#0ff0fc]'
                        }`}
                        onClick={() => {
                          // Keep profile menu open when navigating between profile items
                          setIsProfileOpen(true);
                          handleNavClick();
                        }}
                      >
                        {item.icon}
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Floating particles for consistent theme */}
        <div className="absolute bottom-[20%] left-[30%] w-2 h-2 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30 pointer-events-none" style={{ animationDuration: "8s" }}></div>
        <div className="absolute top-[60%] left-[20%] w-1.5 h-1.5 rounded-full bg-[#0ff0fc]/10 animate-float border border-[#0ff0fc]/20 pointer-events-none" style={{ animationDuration: "6s", animationDelay: "1s" }}></div>
      </div>
    </>
  );
};

// Export memoized version to prevent unnecessary re-renders
export default memo(Sidebar); 