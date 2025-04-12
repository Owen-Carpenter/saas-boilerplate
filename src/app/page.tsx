'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { redirectToCheckout } from '@/lib/stripe';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState<{
    free: boolean;
    pro: boolean;
    enterprise: boolean;
  }>({
    free: false,
    pro: false,
    enterprise: false,
  });
  
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User already logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSubscription = async (plan: 'free' | 'pro' | 'enterprise') => {
    setLoading({ ...loading, [plan]: true });
    
    try {
      await redirectToCheckout(plan, true);
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to redirect to checkout. Please try again.');
    } finally {
      setLoading({ ...loading, [plan]: false });
    }
  };
  
  // Show a loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0c1220] text-white flex flex-col items-center justify-center">
        <div className="animate-spin mr-2 h-8 w-8 text-[#0ff0fc]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="mt-2 text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="font-sans bg-[#0c1220] text-white min-h-screen relative">
      {/* Glassmorphism Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-center">
        <header className="flex items-center p-4 px-8 mt-6 max-w-5xl w-full rounded-full backdrop-blur-md bg-black/30 border border-[#0ff0fc]/20 shadow-lg z-50 animate-slide-down pulse-cyan">
          <div className="flex items-center mr-8">
            <span className="text-xl font-bold text-glow-cyan-strong">SaaS</span>
            <span className="text-xl font-bold ml-1 text-white">Boilerplate</span>
          </div>
          <nav className="hidden md:flex flex-1 justify-center space-x-8">
            <a href="#features" className="hover-cyan-glow transition-colors hover:scale-105 text-sm uppercase tracking-wide font-medium">Features</a>
            <a href="#tech" className="hover-cyan-glow transition-colors hover:scale-105 text-sm uppercase tracking-wide font-medium">Tech Stack</a>
            <a href="#pricing" className="hover-cyan-glow transition-colors hover:scale-105 text-sm uppercase tracking-wide font-medium">Pricing</a>
            <a href="#testimonials" className="hover-cyan-glow transition-colors hover:scale-105 text-sm uppercase tracking-wide font-medium">Testimonials</a>
          </nav>
          <div className="flex space-x-4 ml-auto">
            <Link href="/auth/signin" className="border border-[#0ff0fc]/30 px-4 py-2 rounded-full text-sm transition-all hover:scale-105 hover:text-glow-cyan hover:border-glow-cyan">Login</Link>
            <Link href="/auth/signup" className="button-cyan-glow px-4 py-2 rounded-full text-sm transition-all hover:scale-105">Sign up free</Link>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="text-center px-4 pt-32 pb-8 max-w-7xl mx-auto">
        <h1 className="text-center mb-6">
          <div className="text-3xl md:text-5xl font-bold mb-2 animate-fade-in text-glow-cyan">Introducing your</div>
          <div className="text-5xl md:text-8xl font-bold bg-gradient-to-r from-[#0ff0fc]/80 via-[#0ff0fc] to-[#0ff0fc]/80 text-transparent bg-clip-text pb-2 animate-gradient">
            Modern SaaS Boilerplate
          </div>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
           A modern SaaS boilerplate for building your next SaaS idea.
        </p>
        
        <div className="flex justify-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <button className="button-cyan-glow px-6 py-3 rounded-md text-lg font-medium transition-all hover:scale-105 flex items-center gap-2">
            <span>Watch the keynote</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </section>

      {/* Tech Stack Showcase Animation */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="relative bg-[#0c1a29] border border-[#0ff0fc]/20 rounded-xl overflow-hidden py-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] opacity-10"></div>
          
          {/* Tech glow effects */}
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-[#0ff0fc]/10 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 pulse-cyan"></div>
          
          <div className="relative z-10 text-center mb-16">
            <h2 className="text-3xl font-bold text-glow-cyan-strong mb-4">Built with cutting-edge stack</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Our platform leverages the most powerful modern technologies for unmatched performance and developer experience.</p>
          </div>
          
          {/* Tech icons spinning in orbit */}
          <div className="relative max-w-3xl mx-auto h-[300px] md:h-[400px]">
            {/* Center SaaS logo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0c1a29] p-4 rounded-full border border-[#0ff0fc]/40 shadow-lg z-20">
              <div className="bg-[#0c1a29] p-5 rounded-full border border-[#0ff0fc] shadow-lg pulse-cyan">
                <div className="text-2xl font-bold text-glow-cyan-strong">SaaS</div>
              </div>
            </div>
            
            {/* Orbit rings */}
            <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] border border-[#0ff0fc]/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] border border-[#0ff0fc]/15 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-[#0ff0fc]/10 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Tech Icons */}
            {/* NextJS */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(-172px, -162px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-1">
                <svg className="w-10 h-10" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_408_139" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                    <circle cx="90" cy="90" r="90" fill="black" />
                  </mask>
                  <g mask="url(#mask0_408_139)">
                    <circle cx="90" cy="90" r="87" fill="black" stroke="white" strokeWidth="6" />
                    <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_139)" />
                    <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_139)" />
                  </g>
                  <defs>
                    <linearGradient id="paint0_linear_408_139" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_408_139" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* React */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(112px, -162px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-2">
                <svg className="w-10 h-10" viewBox="-11.5 -10.23174 23 20.46348" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
                  <g stroke="#61dafb" strokeWidth="1" fill="none">
                    <ellipse rx="11" ry="4.2"/>
                    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
                  </g>
                </svg>
              </div>
            </div>
            
            {/* Tailwind */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(-230px, -20px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-3">
                <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 13.7q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9q-2.8-.7-4.9 2.1Zm-7 8.4q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9q-2.8-.7-4.9 2.1Z" fill="#38bdf8"/>
                </svg>
              </div>
            </div>
            
            {/* Shadcn */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(170px, -20px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-4">
                <svg className="w-9 h-9" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="white" d="M165.7.7 73.5 128l92.2 127.3 57.2-66V66.7L165.7.7Z"></path>
                  <path fill="white" d="M83.6 128 0 59.2V66l63.8 62L0 190v6.8L83.6 128Z"></path>
                </svg>
              </div>
            </div>
            
            {/* Stripe */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(-30px, -220px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-5">
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#33ECFF" fillOpacity="0.1"/>
                  <path d="M17.6209 16.6C17.6209 15.3 18.6209 14.5 20.3209 14.5C22.7209 14.5 24.4209 15.7 25.5209 17.3L28.8209 15.3C27.2209 12.7 24.1209 11 20.2209 11C15.4209 11 12.0209 13.9 12.0209 16.8C12.0209 22.8 20.3209 21.1 20.3209 23.8C20.3209 25.3 19.0209 26 17.3209 26C14.6209 26 12.7209 24.4 11.8209 22.8L8.42091 24.9C9.92091 27.6 12.9209 29.5 17.2209 29.5C22.0209 29.5 26.0209 27.1 26.0209 23.6C26.0209 17.3 17.6209 19.2 17.6209 16.6Z" fill="white"/>
                </svg>
              </div>
            </div>
            
            {/* Supabase */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(-30px, 180px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-6">
                <svg className="w-9 h-9" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)"/>
                  <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
                  <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="white"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#249361"/>
                      <stop offset="1" stopColor="#3ECF8E"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="106.782" gradientUnits="userSpaceOnUse">
                      <stop/>
                      <stop offset="1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* Resend */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(-172px, 122px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-3" style={{ animationDelay: "2s" }}>
                <svg className="w-9 h-9" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 42.5C34.665 42.5 42.5 34.665 42.5 25C42.5 15.335 34.665 7.5 25 7.5C15.335 7.5 7.5 15.335 7.5 25C7.5 34.665 15.335 42.5 25 42.5Z" fill="#ffffff"/>
                  <path d="M25 32.65L32.65 25L25 17.35L17.35 25L25 32.65Z" fill="#0c1a29"/>
                </svg>
              </div>
            </div>
            
            {/* Vercel */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16" style={{ transform: "translate(112px, 122px)" }}>
              <div className="bg-[#0c1a29] p-3 rounded-full border border-[#0ff0fc]/30 hover:border-glow-cyan shadow-lg transition-all duration-300 hover:scale-110 w-full h-full flex items-center justify-center tech-float-4" style={{ animationDelay: "1.8s" }}>
                <svg className="w-9 h-9" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 48l240 416H16L256 48z" fill="white"/>
                </svg>
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-[20%] left-[30%] w-3 h-3 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30" style={{ animationDuration: "10s" }}></div>
            <div className="absolute top-[70%] left-[40%] w-2 h-2 rounded-full bg-[#0ff0fc]/30 animate-float border border-[#0ff0fc]/40" style={{ animationDuration: "7s", animationDelay: "1s" }}></div>
            <div className="absolute top-[30%] left-[80%] w-4 h-4 rounded-full bg-[#0ff0fc]/10 animate-float border border-[#0ff0fc]/20" style={{ animationDuration: "8s", animationDelay: "0.5s" }}></div>
            <div className="absolute top-[60%] left-[15%] w-2 h-2 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30" style={{ animationDuration: "12s", animationDelay: "2s" }}></div>
            <div className="absolute top-[40%] left-[75%] w-3 h-3 rounded-full bg-[#0ff0fc]/30 animate-float border border-[#0ff0fc]/40" style={{ animationDuration: "9s", animationDelay: "1.5s" }}></div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in text-glow-cyan-strong">Powered by cutting-edge technology</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal">
            <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Next.js</h3>
            <p className="text-gray-300">React framework with server-side rendering, routing, and API routes.</p>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-100">
            <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Tailwind CSS</h3>
            <p className="text-gray-300">Utility-first CSS framework for rapid UI development without leaving HTML.</p>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-200">
            <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Supabase</h3>
            <p className="text-gray-300">Open source Firebase alternative with PostgreSQL database, auth, and storage.</p>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal">
            <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Stripe</h3>
            <p className="text-gray-300">Complete payment platform with subscriptions, one-time payments, and more.</p>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-100">
            <h3 className="text-xl font-semibold mb-3 text-glow-cyan">NextAuth.js</h3>
            <p className="text-gray-300">Authentication for Next.js with multiple providers and secure sessions.</p>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-200">
            <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Open AI</h3>
            <p className="text-gray-300">Production-ready motion library for animations in React applications.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-[#0a1018] border-t border-[#0ff0fc]/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in text-glow-cyan-strong">Why choose this boilerplate?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center animate-reveal">
              <div className="h-36 bg-[#0c1a29] mb-4 rounded-lg flex items-center justify-center transition-transform hover:scale-105 border border-[#0ff0fc]/20 hover:border-glow-cyan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-glow-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Production Ready</h3>
              <p className="text-gray-300">Launch faster with pre-configured auth, payments, and database integration.</p>
            </div>
            
            <div className="text-center animate-reveal animate-reveal-delay-100">
              <div className="h-36 bg-[#0c1a29] mb-4 rounded-lg flex items-center justify-center transition-transform hover:scale-105 border border-[#0ff0fc]/20 hover:border-glow-cyan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-glow-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Secure & Scalable</h3>
              <p className="text-gray-300">Built with security best practices and scales as your application grows.</p>
            </div>
            
            <div className="text-center animate-reveal animate-reveal-delay-200">
              <div className="h-36 bg-[#0c1a29] mb-4 rounded-lg flex items-center justify-center transition-transform hover:scale-105 border border-[#0ff0fc]/20 hover:border-glow-cyan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-glow-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-glow-cyan">Developer Experience</h3>
              <p className="text-gray-300">Optimized for developer productivity with TypeScript and modern tooling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3 animate-fade-in text-glow-cyan-strong">Subscription Plans</h2>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>Choose the perfect plan for your needs with our simple subscription model.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Free</h3>
              <span className="bg-[#0ff0fc]/10 text-[#0ff0fc] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#0ff0fc]/20">STARTER</span>
            </div>
            <p className="text-4xl font-bold mb-1 text-glow-cyan">$0</p>
            <p className="text-sm text-gray-400 mb-6">Free forever, no credit card required</p>
            
            <div className="border-t border-[#0ff0fc]/10 pt-6 mb-6">
              <p className="text-sm text-gray-300 mb-4">Basic features with demo access:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access to boilerplate demo</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic components preview</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Limited feature exploration</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>View-only documentation</span>
                </li>
              </ul>
            </div>
            <button 
              className="w-full py-2.5 border border-[#0ff0fc]/30 hover:border-[#0ff0fc] rounded-md transition-all hover:bg-[#0ff0fc]/10 hover:text-glow-cyan flex items-center justify-center"
              onClick={() => handleSubscription('free')}
              disabled={loading.free}
            >
              {loading.free ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Get Started'}
            </button>
          </div>
          
          <div className="bg-[#0c1a29] p-8 rounded-lg border-2 border-[#0ff0fc] shadow-[0_0_20px_rgba(15,240,252,0.3)] relative hover:-translate-y-2 transition-all animate-reveal animate-reveal-delay-100 z-10">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#0ff0fc]/30 text-glow-cyan-strong px-4 py-1 rounded-full text-sm font-medium border border-[#0ff0fc]">POPULAR</div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <span className="bg-[#0ff0fc]/10 text-[#0ff0fc] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#0ff0fc]/20">PROFESSIONAL</span>
            </div>
            <p className="text-4xl font-bold mb-1 text-glow-cyan-strong">$20</p>
            <p className="text-sm text-gray-200 mb-6">per month, billed monthly</p>
            
            <div className="border-t border-[#0ff0fc]/20 pt-6 mb-6">
              <p className="text-sm text-gray-200 mb-4">Full access to the SaaS boilerplate:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete boilerplate access</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full source code download</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All UI components & templates</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Authentication system</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>API routes & documentation</span>
                </li>
              </ul>
            </div>
            <button 
              className="w-full py-2.5 bg-[#0ff0fc]/20 text-white border border-[#0ff0fc] rounded-md transition-all hover:scale-105 hover:bg-[#0ff0fc]/30 text-glow-cyan-strong flex items-center justify-center"
              onClick={() => handleSubscription('pro')}
              disabled={loading.pro}
            >
              {loading.pro ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Subscribe Now'}
            </button>
          </div>
          
          <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
              <span className="bg-[#0ff0fc]/10 text-[#0ff0fc] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#0ff0fc]/20">BUSINESS</span>
            </div>
            <p className="text-4xl font-bold mb-1 text-glow-cyan">$100</p>
            <p className="text-sm text-gray-400 mb-6">per month, billed monthly</p>
            
            <div className="border-t border-[#0ff0fc]/10 pt-6 mb-6">
              <p className="text-sm text-gray-300 mb-4">Premium features with advanced integrations:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All Pro features</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Custom branding options</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Extended API access</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>White label solution</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#0ff0fc] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support & updates</span>
                </li>
              </ul>
            </div>
            <button 
              className="w-full py-2.5 border border-[#0ff0fc]/30 hover:border-[#0ff0fc] rounded-md transition-all hover:bg-[#0ff0fc]/10 hover:text-glow-cyan flex items-center justify-center"
              onClick={() => handleSubscription('enterprise')}
              disabled={loading.enterprise}
            >
              {loading.enterprise ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-[#0a1018] border-t border-[#0ff0fc]/10">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <p className="text-lg text-gray-300 mb-10">Trusted by developers from top companies</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-70">
            <div className="w-24 hover:text-glow-cyan transition-opacity">Google</div>
            <div className="w-24 hover:text-glow-cyan transition-opacity">Microsoft</div>
            <div className="w-24 hover:text-glow-cyan transition-opacity">Stripe</div>
            <div className="w-24 hover:text-glow-cyan transition-opacity">Vercel</div>
            <div className="w-24 hover:text-glow-cyan transition-opacity">GitHub</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 animate-fade-in text-glow-cyan-strong">What developers say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal">
            <p className="italic mb-4">"This boilerplate saved me weeks of setup time. All the essential integrations are already configured."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#0ff0fc]/20 rounded-full mr-3 border border-[#0ff0fc]/30"></div>
              <div>
                <p className="font-medium">Alex Chen</p>
                <p className="text-sm text-gray-400">Frontend Developer</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-100">
            <p className="italic mb-4">"The authentication and payment integrations work flawlessly. Perfect starting point for my SaaS project."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#0ff0fc]/20 rounded-full mr-3 border border-[#0ff0fc]/30"></div>
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-gray-400">Full Stack Developer</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0c1a29] p-6 rounded-lg border border-[#0ff0fc]/10 hover:border-glow-cyan transition-all hover:-translate-y-1 animate-reveal animate-reveal-delay-200">
            <p className="italic mb-4">"Clean code, well-documented, and built with modern best practices. I can focus on building features instead of infrastructure."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#0ff0fc]/20 rounded-full mr-3 border border-[#0ff0fc]/30"></div>
              <div>
                <p className="font-medium">Miguel Rodriguez</p>
                <p className="text-sm text-gray-400">CTO, StartupName</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#0c1a29] border border-[#0ff0fc]/20 rounded-lg mx-6 my-12 text-white bg-cyan-gradient">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <h2 className="text-3xl font-bold mb-6 text-glow-cyan-strong">Ready to build your next big idea?</h2>
          <p className="text-xl mb-8">Get started with our SaaS boilerplate today and launch faster.</p>
          <button 
            className="button-cyan-glow px-8 py-3 rounded-md font-medium transition-all hover:scale-105 flex items-center justify-center mx-auto"
            onClick={() => handleSubscription('free')}
            disabled={loading.free}
          >
            {loading.free ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Start building now'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0c1220] py-12 px-4 border-t border-[#0ff0fc]/10 animate-fade-in">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-glow-cyan">SaaS Boilerplate</h3>
            <p className="text-gray-400">Modern starter kit for Next.js applications.</p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-white">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-glow-cyan transition-colors">GitHub</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-glow-cyan transition-colors">About</a></li>
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-glow-cyan transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#0ff0fc]/10 text-center text-gray-400">
          <p>&copy; 2023 SaaS Boilerplate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
