"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Code, Check, Star, Zap, Copy, ExternalLink, Download, TerminalSquare, GitBranch, Shield, Cpu, Lock, FileCode, Gem } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSubscription } from '@/context/SubscriptionContext';

export default function BoilerplatePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('features');
  const { subscription, isPro, isEnterprise } = useSubscription();
  
  // Get user plan from subscription context
  const userPlan = subscription?.plan || 'free';
  const hasFullAccess = isPro || isEnterprise;
  
  const features = {
    all: [
      { name: "React 18 + Next.js 14", description: "Latest versions with App Router support" },
      { name: "TypeScript Configuration", description: "Type-safe code with custom type definitions" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid development" },
      { name: "Authentication", description: "Complete auth system with NextAuth.js and Supabase" },
      { name: "Database Integration", description: "Ready-to-use Supabase database configuration" },
      { name: "API Routes", description: "Structured API endpoints with validation" },
    ],
    free: [
      { name: "React 18 + Next.js 14", description: "Latest versions with App Router support" },
      { name: "TypeScript Configuration", description: "Type-safe code with custom type definitions" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid development" },
    ],
    pro: [
      { name: "Authentication", description: "Complete auth system with NextAuth.js and Supabase" },
      { name: "Database Integration", description: "Ready-to-use Supabase database configuration" },
      { name: "API Routes", description: "Structured API endpoints with validation" },
      { name: "Email Templates", description: "Customizable email templates for notifications" },
      { name: "Stripe Integration", description: "Payment processing and subscription management" },
      { name: "Admin Dashboard", description: "User management and analytics dashboard" },
    ],
    enterprise: [
      { name: "Custom Branding", description: "White-label solution with your brand assets" },
      { name: "Extended Support", description: "Priority support and implementation assistance" },
      { name: "Custom Integrations", description: "Tailored third-party service integrations" },
      { name: "SSO Authentication", description: "Enterprise single sign-on capabilities" },
    ]
  };

  // Demo mode banner for free users
  const DemoBanner = () => (
    <div className="bg-gradient-to-r from-[#0c1a29] to-[#1a1033] border border-[#0ff0fc]/30 rounded-md p-4 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc]/30 flex items-center justify-center mr-3">
            <Star className="h-5 w-5 text-[#0ff0fc]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Demo Mode</h3>
            <p className="text-sm text-gray-300">You're currently using this app as a demo of the boilerplate</p>
          </div>
        </div>
        <Link 
          href="/dashboard/billing#plans"
          className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all flex items-center"
        >
          <Zap className="h-4 w-4 mr-2" />
          Upgrade for Full Access
        </Link>
      </div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#0ff0fc]/5 blur-3xl pointer-events-none"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Demo Banner for free users */}
      {!hasFullAccess && <DemoBanner />}

      {/* Header with gradient text */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-glow-cyan-strong">SaaS</span>{" "}
          <span className="bg-gradient-to-r from-[#0ff0fc] via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Boilerplate
          </span>
        </h1>
        <p className="text-gray-400 text-lg">Enterprise-ready starter kit for your next project</p>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repository Details - Left Column */}
        <div className="lg:col-span-2">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg h-full">
            <CardHeader className="pb-2 relative">
              <div className="absolute top-4 right-4 flex items-center bg-[#0a1018] px-3 py-1 rounded-full border border-[#0ff0fc]/20">
                <Star className="h-4 w-4 text-[#0ff0fc] mr-2" />
                <span className="text-white text-sm">487</span>
                <GitBranch className="h-4 w-4 text-[#0ff0fc] mx-2" />
                <span className="text-white text-sm">126</span>
              </div>
              <CardTitle className="text-white text-xl flex items-center pt-2">
                <Code className="h-6 w-6 mr-3 text-[#0ff0fc]" />
                SaaS Boilerplate Repository
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Production-ready Next.js template with authentication, database, payments, and more
              </p>
            </CardHeader>
            
            <CardContent className="p-5">
              {/* Repository Screenshot/Preview */}
              <div className="relative mb-6 rounded-md overflow-hidden border border-[#0ff0fc]/20 bg-[#0a1018]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1018] to-transparent opacity-60 z-10"></div>
                <div className="h-64 bg-gradient-to-r from-[#0c1a29] to-[#1a1033] flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-3 p-6 w-full max-w-3xl relative z-0">
                    {/* Mock UI components */}
                    <div className="col-span-1 space-y-3">
                      <div className="h-8 w-full bg-[#0ff0fc]/10 rounded-md border border-[#0ff0fc]/30"></div>
                      <div className="h-24 w-full bg-[#0ff0fc]/10 rounded-md border border-[#0ff0fc]/30"></div>
                      <div className="h-16 w-full bg-[#0ff0fc]/10 rounded-md border border-[#0ff0fc]/30"></div>
                    </div>
                    <div className="col-span-2 space-y-3">
                      <div className="h-12 w-full bg-[#0ff0fc]/10 rounded-md border border-[#0ff0fc]/30"></div>
                      <div className="h-32 w-full bg-[#0ff0fc]/10 rounded-md border border-[#0ff0fc]/30"></div>
                      <div className="h-12 w-full bg-[#0ff0fc]/10 rounded-md border border-[#0ff0fc]/30"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 z-20">
                  <button className="px-3 py-1.5 bg-[#0ff0fc]/20 text-white border border-[#0ff0fc] rounded-full text-sm hover:bg-[#0ff0fc]/30 transition-all text-glow-cyan">
                    Preview Demo
                  </button>
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <div className="border-b border-[#0ff0fc]/20 mb-6">
                <div className="flex space-x-6">
                  <button
                    className={`pb-2 text-sm font-medium transition-all ${
                      activeTab === 'features'
                        ? 'text-[#0ff0fc] border-b-2 border-[#0ff0fc] text-glow-cyan'
                        : 'text-gray-400 hover:text-[#0ff0fc]'
                    }`}
                    onClick={() => setActiveTab('features')}
                  >
                    Features
                  </button>
                  <button
                    className={`pb-2 text-sm font-medium transition-all ${
                      activeTab === 'installation'
                        ? 'text-[#0ff0fc] border-b-2 border-[#0ff0fc] text-glow-cyan'
                        : 'text-gray-400 hover:text-[#0ff0fc]'
                    }`}
                    onClick={() => setActiveTab('installation')}
                  >
                    Installation
                  </button>
                  <button
                    className={`pb-2 text-sm font-medium transition-all ${
                      activeTab === 'structure'
                        ? 'text-[#0ff0fc] border-b-2 border-[#0ff0fc] text-glow-cyan'
                        : 'text-gray-400 hover:text-[#0ff0fc]'
                    }`}
                    onClick={() => setActiveTab('structure')}
                  >
                    Structure
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.all.map((feature, index) => (
                    <div key={index} className={`p-3 rounded-md border ${index >= 3 ? 'border-[#0ff0fc]/40 bg-[#0ff0fc]/5' : 'border-[#0ff0fc]/20 bg-[#0a1018]'}`}>
                      <div className="flex items-start">
                        <div className={`mt-0.5 mr-3 ${index >= 3 ? 'text-[#0ff0fc]' : 'text-[#0ff0fc]/70'}`}>
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{feature.name}</h3>
                          <p className="text-sm text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                      {index >= 3 && (
                        <div className="mt-2 ml-8">
                          <span className="text-xs px-2 py-0.5 bg-[#0ff0fc]/10 text-[#0ff0fc] rounded-full border border-[#0ff0fc]/30">
                            Pro Feature
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'installation' && (
                <div>
                  {hasFullAccess ? (
                    <>
                      <div className="mb-6">
                        <h3 className="text-white font-medium mb-2 flex items-center">
                          <TerminalSquare className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                          Installation Commands
                        </h3>
                        <div className="bg-[#050a0f] p-4 rounded-md border border-[#0ff0fc]/10 font-mono text-sm text-gray-300 relative">
                          <code className="block whitespace-pre overflow-x-auto">
                            # Clone the repository<br />
                            git clone https://github.com/saas-boilerplate/saas-starter.git my-project<br /><br />
                            # Navigate to project<br />
                            cd my-project<br /><br />
                            # Install dependencies<br />
                            npm install<br /><br />
                            # Start development server<br />
                            npm run dev
                          </code>
                          <button className="absolute top-2 right-2 p-1 bg-[#0c1a29] rounded hover:bg-[#0ff0fc]/10 transition-all">
                            <Copy className="h-4 w-4 text-[#0ff0fc]/70" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium mb-2 flex items-center">
                          <FileCode className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                          Environment Setup
                        </h3>
                        <div className="bg-[#050a0f] p-4 rounded-md border border-[#0ff0fc]/10 font-mono text-sm text-gray-300 relative">
                          <code className="block whitespace-pre overflow-x-auto">
                            # Create .env.local file<br />
                            cp .env.example .env.local<br /><br />
                            # Update with your credentials<br />
                            NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br />
                            NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key<br />
                            NEXTAUTH_SECRET=your_nextauth_secret<br />
                            STRIPE_SECRET_KEY=your_stripe_secret<br />
                            STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
                          </code>
                          <button className="absolute top-2 right-2 p-1 bg-[#0c1a29] rounded hover:bg-[#0ff0fc]/10 transition-all">
                            <Copy className="h-4 w-4 text-[#0ff0fc]/70" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-[#0a1018] p-6 rounded-md border border-[#0ff0fc]/10 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-[#0ff0fc]/70" />
                      </div>
                      <h3 className="text-white font-medium text-lg mb-2">Repository Access Required</h3>
                      <p className="text-gray-400 mb-4">
                        This application is a demo of the boilerplate. Purchase the Pro or Enterprise plan to get access to the full source code repository.
                      </p>
                      <Link 
                        href="/dashboard/billing#plans"
                        className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all inline-flex items-center"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to Access
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'structure' && (
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-[#0ff0fc]" />
                    Project Structure Overview
                  </h3>
                  {hasFullAccess ? (
                    <div className="bg-[#050a0f] p-4 rounded-md border border-[#0ff0fc]/10 font-mono text-sm text-gray-300 h-[300px] overflow-y-auto">
                      <pre className="text-xs">
                        ├── public/               # Static assets<br />
                        ├── src/<br />
                        │   ├── app/              # Next.js App Router<br />
                        │   │   ├── api/          # API routes<br />
                        │   │   │   ├── auth/     # Authentication endpoints<br />
                        │   │   │   ├── stripe/   # Payment endpoints<br />
                        │   │   │   └── webhook/  # Webhooks<br />
                        │   │   ├── auth/         # Auth pages<br />
                        │   │   │   ├── signin/   # Sign in page<br />
                        │   │   │   └── signup/   # Sign up page<br />
                        │   │   ├── dashboard/    # Dashboard pages<br />
                        │   │   │   ├── billing/  # Billing page<br />
                        │   │   │   └── profile/  # Profile page<br />
                        │   │   ├── layout.tsx    # Root layout<br />
                        │   │   └── page.tsx      # Home page<br />
                        │   ├── components/       # UI components<br />
                        │   │   ├── dashboard/    # Dashboard components<br />
                        │   │   ├── landing/      # Landing page components<br />
                        │   │   └── ui/           # Reusable UI components<br />
                        │   ├── lib/              # Utilities and libs<br />
                        │   │   ├── auth.ts       # Auth helpers<br />
                        │   │   ├── db.ts         # Database client<br />
                        │   │   └── stripe.ts     # Stripe integration<br />
                        │   ├── types/            # TypeScript declarations<br />
                        │   └── styles/           # Global styles<br />
                        ├── .env.example          # Environment variables<br />
                        ├── next.config.js        # Next.js configuration<br />
                        ├── package.json          # Dependencies<br />
                        ├── tailwind.config.js    # Tailwind CSS config<br />
                        ├── tsconfig.json         # TypeScript config<br />
                        └── README.md             # Documentation
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-[#050a0f] p-4 rounded-md border border-[#0ff0fc]/10 font-mono text-sm text-gray-300 h-[300px] overflow-y-auto relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050a0f] z-10"></div>
                      <pre className="text-xs relative z-0">
                        ├── public/               # Static assets<br />
                        ├── src/<br />
                        │   ├── app/              # Next.js App Router<br />
                        │   │   ├── api/          # API routes<br />
                        │   │   │   ├── auth/     # Authentication endpoints<br />
                        │   │   │   ├── stripe/   # Payment endpoints<br />
                        │   │   │   └── webhook/  # Webhooks<br />
                        │   │   ├── auth/         # Auth pages<br />
                        │   │   │   ├── signin/   # Sign in page<br />
                        │   │   │   └── signup/   # Sign up page<br />
                        │   │   ├── dashboard/    # Dashboard pages<br />
                        {/* Limited view for free users */}
                      </pre>
                      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-center bg-gradient-to-t from-[#050a0f] to-transparent z-20">
                        <p className="text-gray-400 mb-4 text-center">
                          View the complete project structure with a Pro or Enterprise subscription
                        </p>
                        <Link 
                          href="/dashboard/billing#plans"
                          className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-md text-sm text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all inline-flex items-center"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade to View Full Structure
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Access Details - Right Column */}
        <div className="lg:col-span-1">
          <Card className="bg-[#0c1a29] border border-[#0ff0fc]/20 shadow-lg mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Repository Access</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {session ? (
                <>
                  <div className="mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mr-3">
                      {userPlan === 'free' && <Star className="h-5 w-5 text-[#0ff0fc]" />}
                      {userPlan === 'pro' && <Gem className="h-5 w-5 text-[#0ff0fc]" />}
                      {userPlan === 'enterprise' && <Shield className="h-5 w-5 text-[#0ff0fc]" />}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {userPlan === 'free' && "Free Plan"}
                        {userPlan === 'pro' && "Pro Plan"}
                        {userPlan === 'enterprise' && "Enterprise Plan"}
                      </h3>
                      <p className="text-sm text-[#0ff0fc]/70">
                        {userPlan === 'free' ? 'Demo access only' : userPlan === 'pro' ? 'Full repository access' : 'Premium repository access'}
                      </p>
                    </div>
                  </div>
                  
                  {userPlan === 'free' ? (
                    <div className="mb-5 p-4 bg-[#0a1018] rounded-md border border-[#0ff0fc]/20">
                      <p className="text-sm text-gray-300 mb-3">
                        You're currently using this application as a demo of the boilerplate. Upgrade to Pro or Enterprise for the full source code.
                      </p>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <Check className="h-4 w-4 text-[#0ff0fc]/70 mr-2" />
                        <span>Demo application access</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <Check className="h-4 w-4 text-[#0ff0fc]/70 mr-2" />
                        <span>Limited feature preview</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Lock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-500">Repository access</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-4 bg-gradient-to-r from-[#0c1a29] to-[#1a1033] rounded-md border border-[#0ff0fc]/30">
                      <p className="text-sm text-gray-300 mb-3">
                        You have full access to the boilerplate source code repository with all features and components.
                      </p>
                      <div className="flex items-center text-sm text-gray-300 mb-2">
                        <Check className="h-4 w-4 text-[#0ff0fc] mr-2" />
                        <span>Full repository access</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300 mb-2">
                        <Check className="h-4 w-4 text-[#0ff0fc] mr-2" />
                        <span>Source code download</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Check className="h-4 w-4 text-[#0ff0fc] mr-2" />
                        <span>{userPlan === 'enterprise' ? 'Priority support' : 'Standard support'}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {userPlan === 'free' ? (
                      <Link
                        href="/dashboard"
                        className="w-full py-2.5 bg-[#0a1018] border border-[#0ff0fc]/30 text-white hover:bg-[#0ff0fc]/10 rounded-full text-sm font-medium flex items-center justify-center transition-all"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Continue Exploring Demo
                      </Link>
                    ) : (
                      <a 
                        href={userPlan === 'pro'
                          ? "https://github.com/saas-boilerplate/saas-starter-pro"
                          : "https://github.com/saas-boilerplate/saas-starter-enterprise"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 rounded-full text-sm font-medium flex items-center justify-center transition-all"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Access Repository
                      </a>
                    )}
                    
                    {userPlan === 'free' && (
                      <Link 
                        href="/dashboard/billing#plans"
                        className="w-full py-2.5 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-full text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all text-sm font-medium flex items-center justify-center"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-[#0ff0fc]/70" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Sign in Required</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Please sign in to access the repository and boilerplate features
                  </p>
                  <Link 
                    href="/api/auth/signin"
                    className="w-full py-2.5 bg-[#0ff0fc]/20 border border-[#0ff0fc] rounded-full text-glow-cyan-strong hover:bg-[#0ff0fc]/30 hover:scale-105 transition-all text-sm font-medium inline-block"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {session && (
            <Card className="bg-gradient-to-r from-[#0c1a29] to-[#12142b] border border-[#0ff0fc]/20 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 flex items-center justify-center mr-3">
                    <Cpu className="h-4 w-4 text-[#0ff0fc]" />
                  </div>
                  <h3 className="text-white font-medium">Tech Stack</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Next.js</span>
                    <span className="text-xs px-2 py-0.5 bg-[#0ff0fc]/10 text-[#0ff0fc] rounded-full">v14.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">React</span>
                    <span className="text-xs px-2 py-0.5 bg-[#0ff0fc]/10 text-[#0ff0fc] rounded-full">v18.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">TypeScript</span>
                    <span className="text-xs px-2 py-0.5 bg-[#0ff0fc]/10 text-[#0ff0fc] rounded-full">v5.1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Tailwind CSS</span>
                    <span className="text-xs px-2 py-0.5 bg-[#0ff0fc]/10 text-[#0ff0fc] rounded-full">v3.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Supabase</span>
                    <span className="text-xs px-2 py-0.5 bg-[#0ff0fc]/10 text-[#0ff0fc] rounded-full">v2.33</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#0ff0fc]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Last updated</span>
                    <span className="text-xs text-gray-400">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 