'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signUpWithEmailPassword } from '@/lib/auth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams ? searchParams.get('callbackUrl') || '/dashboard' : '/dashboard';
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User already logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signUpWithEmailPassword(email, password, name, phone);

      if (!result.success) {
        setError(result.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Redirect to login page on successful signup
      router.push(`/auth/signin?email=${encodeURIComponent(email)}&signupSuccess=true`);
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0c1220] text-white flex flex-col items-center justify-center">
        <div className="animate-spin mr-2 h-8 w-8 text-[#0ff0fc]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="mt-2 text-white">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1220] text-white flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#0ff0fc]/5 filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-[#0ff0fc]/10 filter blur-3xl"></div>
      
      {/* Glassmorphism Header */}
      <div className="relative z-10">
        <header className="flex items-center p-4 px-8 mt-6 mx-auto max-w-5xl rounded-full backdrop-blur-md bg-black/30 border border-[#0ff0fc]/20 shadow-lg animate-slide-down">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-glow-cyan-strong">SaaS</span>
            <span className="text-xl font-bold ml-1 text-white">Boilerplate</span>
          </Link>
          <div className="ml-auto flex space-x-4">
            <Link href="/auth/signin" className="border border-[#0ff0fc]/30 px-4 py-2 rounded-full text-sm transition-all hover:scale-105 hover:text-glow-cyan hover:border-glow-cyan">
              Sign in
            </Link>
          </div>
        </header>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/20 shadow-lg w-full max-w-md animate-fade-in">
          <h1 className="text-2xl font-bold mb-6 text-glow-cyan-strong">Create your account</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                className="w-full p-3 bg-[#0a1018] border border-[#0ff0fc]/20 rounded-md focus:outline-none focus:border-[#0ff0fc]/50 focus:ring-1 focus:ring-[#0ff0fc]/30 transition-all"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-300">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className="w-full p-3 bg-[#0a1018] border border-[#0ff0fc]/20 rounded-md focus:outline-none focus:border-[#0ff0fc]/50 focus:ring-1 focus:ring-[#0ff0fc]/30 transition-all"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 bg-[#0a1018] border border-[#0ff0fc]/20 rounded-md focus:outline-none focus:border-[#0ff0fc]/50 focus:ring-1 focus:ring-[#0ff0fc]/30 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">Password</label>
              <input
                type="password"
                id="password"
                className="w-full p-3 bg-[#0a1018] border border-[#0ff0fc]/20 rounded-md focus:outline-none focus:border-[#0ff0fc]/50 focus:ring-1 focus:ring-[#0ff0fc]/30 transition-all"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong rounded-md transition-all hover:bg-[#0ff0fc]/30 hover:scale-[1.02] font-medium flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-[#0ff0fc]/10">
            <p className="text-sm text-gray-400 mb-2">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
            <p className="text-gray-400 text-center">Already have an account?</p>
            <Link href="/auth/signin" className="text-[#0ff0fc] hover:text-glow-cyan font-medium transition-all hover:scale-105 inline-block mt-2 w-full text-center">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute bottom-[20%] left-[30%] w-3 h-3 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30" style={{ animationDuration: "10s" }}></div>
      <div className="absolute top-[70%] right-[40%] w-2 h-2 rounded-full bg-[#0ff0fc]/30 animate-float border border-[#0ff0fc]/40" style={{ animationDuration: "7s", animationDelay: "1s" }}></div>
      <div className="absolute top-[20%] right-[20%] w-4 h-4 rounded-full bg-[#0ff0fc]/10 animate-float border border-[#0ff0fc]/20" style={{ animationDuration: "8s", animationDelay: "0.5s" }}></div>
    </div>
  );
} 