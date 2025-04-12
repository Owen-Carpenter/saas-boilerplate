"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, MessageSquare, ArrowRight, Zap, Star, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [subscription, setSubscription] = useState({ plan: 'free', status: 'active' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Fetch user's subscription
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            setSubscription(data.subscription);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscription();
  }, []);
  
  // Simplified saved items with focus on product 1 and 2
  const savedItems = [
    { 
      id: 1, 
      type: 'homework', 
      title: 'Calculus Integration Assignment', 
      preview: 'Methods for solving complex integrals with trigonometric substitutions',
      date: '2 hours ago',
      solved: 12,
      subject: 'Math',
      productPage: '/dashboard/product-1'
    },
    { 
      id: 2, 
      type: 'chat', 
      title: 'Marketing Strategy Notes', 
      preview: 'AI-generated marketing plan for SaaS product launch',
      date: 'Yesterday',
      messages: 28,
      category: 'Business',
      productPage: '/dashboard/product-2'
    },
    { 
      id: 3, 
      type: 'homework', 
      title: 'Chemistry Equations Set', 
      preview: 'Balance and solve chemical equations with explanations',
      date: 'Yesterday',
      solved: 8,
      subject: 'Chemistry',
      productPage: '/dashboard/product-1'
    },
    { 
      id: 4, 
      type: 'chat', 
      title: 'React Component Architecture', 
      preview: 'Best practices for structuring complex React applications',
      date: '3 days ago',
      messages: 36,
      category: 'Coding',
      productPage: '/dashboard/product-2'
    }
  ];

  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === activeTab);

  const handleUpgradeClick = () => {
    router.push('/dashboard/billing');
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header - Simplified */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-glow-cyan-strong mb-2">Dashboard</h1>
          <p className="text-gray-400">Use our AI-powered tools to complete your tasks</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link 
            href="/dashboard/product-1"
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0ff0fc]/10 border border-[#0ff0fc]/40 rounded-full text-xs sm:text-sm text-[#0ff0fc] hover:bg-[#0ff0fc]/20 transition-all flex items-center"
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            Homework Helper
          </Link>
          <Link 
            href="/dashboard/product-2"
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0ff0fc]/10 border border-[#0ff0fc]/40 rounded-full text-xs sm:text-sm text-[#0ff0fc] hover:bg-[#0ff0fc]/20 transition-all flex items-center"
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            AI Chat
          </Link>
        </div>
      </div>
      
      {/* Subscription Card - Simplified */}
      <Card className="bg-gradient-to-r from-[#0c1a29] to-[#12142b] border border-[#0ff0fc]/20 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mr-4">
                {subscription.plan === 'free' ? (
                  <Zap className="h-6 w-6 text-[#0ff0fc]" />
                ) : subscription.plan === 'pro' ? (
                  <Star className="h-6 w-6 text-[#0ff0fc]" />
                ) : (
                  <Sparkles className="h-6 w-6 text-[#0ff0fc]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {subscription.plan === 'free' ? 'Free Plan' : 
                   subscription.plan === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
                </h2>
                <p className="text-[#0ff0fc]/70">
                  {subscription.plan === 'free' 
                    ? 'Upgrade for unlimited access' 
                    : 'Unlimited access to all features'}
                </p>
              </div>
            </div>
            
            {subscription.plan === 'free' && (
              <button 
                onClick={handleUpgradeClick}
                className="px-6 py-2 bg-[#0ff0fc]/20 text-white border border-[#0ff0fc] rounded-full transition-all hover:bg-[#0ff0fc]/30 hover:scale-105 text-glow-cyan-strong text-sm font-medium"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Saved Items Section */}
      <div className="mt-8">
        {/* Filter Tabs - Make them responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-glow-cyan">Your Recent Work</h2>
          
          <div className="w-full sm:w-auto flex bg-[#0c1a29] rounded-full p-1 border border-[#0ff0fc]/20">
            <button
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm ${
                activeTab === 'all'
                  ? 'bg-[#0ff0fc]/20 text-[#0ff0fc] border border-[#0ff0fc]/30'
                  : 'text-gray-400 hover:text-[#0ff0fc]'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm ${
                activeTab === 'homework'
                  ? 'bg-[#0ff0fc]/20 text-[#0ff0fc] border border-[#0ff0fc]/30'
                  : 'text-gray-400 hover:text-[#0ff0fc]'
              }`}
              onClick={() => setActiveTab('homework')}
            >
              Homework
            </button>
            <button
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm ${
                activeTab === 'chat'
                  ? 'bg-[#0ff0fc]/20 text-[#0ff0fc] border border-[#0ff0fc]/30'
                  : 'text-gray-400 hover:text-[#0ff0fc]'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              Chats
            </button>
          </div>
        </div>
        
        {/* Grid of Saved Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredItems.map((item) => (
            <Link 
              href={item.productPage} 
              key={item.id}
              className="block"
            >
              <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 hover:border-[#0ff0fc]/40 transition-all h-full hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mr-2">
                        {item.type === 'homework' ? (
                          <BookOpen className="h-4 w-4 text-[#0ff0fc]" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-[#0ff0fc]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#0ff0fc]/70">
                          {item.type === 'homework' ? item.subject : item.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.date}
                    </p>
                  </div>
                  
                  <h3 className="text-md font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.preview}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      {item.type === 'homework' ? (
                        <p className="text-xs text-gray-500">
                          <span className="text-[#0ff0fc]">{item.solved}</span> problems solved
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          <span className="text-[#0ff0fc]">{item.messages}</span> messages
                        </p>
                      )}
                    </div>
                    <div className="text-[#0ff0fc] hover:text-[#0ff0fc]/70">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* Quick Access Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/product-1"
            className="flex-1 px-4 py-3 bg-[#0c1a29] border border-[#0ff0fc]/30 rounded-md text-white hover:bg-[#0ff0fc]/10 transition-all flex items-center justify-center"
          >
            <BookOpen className="h-5 w-5 mr-2 text-[#0ff0fc]" />
            <span>New Homework Session</span>
          </Link>
          <Link
            href="/dashboard/product-2"
            className="flex-1 px-4 py-3 bg-[#0c1a29] border border-[#0ff0fc]/30 rounded-md text-white hover:bg-[#0ff0fc]/10 transition-all flex items-center justify-center"
          >
            <MessageSquare className="h-5 w-5 mr-2 text-[#0ff0fc]" />
            <span>Start New Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 