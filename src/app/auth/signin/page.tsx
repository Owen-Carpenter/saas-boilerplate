'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isVerificationNeeded, setIsVerificationNeeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams ? searchParams.get('callbackUrl') || '/dashboard' : '/dashboard';
  const { data: session, status } = useSession();

  // Check for verification success and password reset success
  useEffect(() => {
    if (searchParams?.get('verified') === 'true') {
      setVerificationSuccess(true);
    }
    
    // Show password reset success message
    if (searchParams?.get('reset') === 'success') {
      setPasswordResetSuccess(true);
    }
    
    // Pre-fill email if provided in URL
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User already logged in, redirecting to dashboard');
      router.push(callbackUrl || '/dashboard');
    }
  }, [session, status, router, callbackUrl]);

  // Clear any existing Supabase sessions on page load
  useEffect(() => {
    const clearSupabaseSession = async () => {
      // Sign out from Supabase on page load to ensure clean state
      await supabase.auth.signOut();
    };
    
    clearSupabaseSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsVerificationNeeded(false);
    setLoading(true);

    try {
      // First try using our direct Supabase auth to get detailed error info
      const { success, error: authError, data: authData } = await signInWithEmailPassword(email, password);
      
      if (!success) {
        // Check if the error is about email verification
        if (authError && authError.toLowerCase().includes('verify') && authError.toLowerCase().includes('email')) {
          setIsVerificationNeeded(true);
          setError('Please verify your email before signing in.');
          setLoading(false);
          return;
        }
        
        // Otherwise, just show the error
        setError(authError || 'Authentication failed');
        setLoading(false);
        return;
      }
      
      // Now use NextAuth to create a session
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        console.error('NextAuth error:', result.error);
        setError('Sign in failed. Please check your credentials and try again.');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Clear any error
        setError('');
        
        // Redirect to the callback URL or dashboard
        console.log('Sign in successful, redirecting to:', callbackUrl || '/dashboard');
        router.push(callbackUrl || '/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Function to resend verification email
  const resendVerification = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(res => res.json());

      if (error) {
        setError(error);
      } else {
        setError('');
        setIsVerificationNeeded(true);
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to send verification email');
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
            <Link href="/auth/signup" className="button-cyan-glow px-4 py-2 rounded-full text-sm transition-all hover:scale-105">
              Sign up free
            </Link>
          </div>
        </header>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/20 shadow-lg w-full max-w-md animate-fade-in">
          <h1 className="text-2xl font-bold mb-6 text-glow-cyan-strong">Sign in to your account</h1>
          
          {verificationSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your email has been verified! You can now sign in.
              </div>
            </div>
          )}
          
          {passwordResetSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your password has been successfully reset. You can now sign in with your new password.
              </div>
            </div>
          )}
          
          {callbackUrl && callbackUrl.includes('/dashboard/billing') && (
            <div className="mb-4 p-3 bg-[#0ff0fc]/10 border border-[#0ff0fc]/30 text-[#0ff0fc] rounded-md">
              Please sign in to continue with your subscription
            </div>
          )}
          
          {isVerificationNeeded && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md">
              <p className="mb-2">Please verify your email before signing in.</p>
              <button 
                onClick={resendVerification}
                className="text-amber-400 hover:text-amber-300 underline text-sm font-medium"
                disabled={loading}
              >
                Resend verification email
              </button>
            </div>
          )}
          
          {error && !isVerificationNeeded && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                <Link href="/auth/forgot-password" className="text-sm text-[#0ff0fc] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                className="w-full p-3 bg-[#0a1018] border border-[#0ff0fc]/20 rounded-md focus:outline-none focus:border-[#0ff0fc]/50 focus:ring-1 focus:ring-[#0ff0fc]/30 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-[#0ff0fc]/10 text-center">
            <p className="text-gray-400">Don't have an account?</p>
            <Link href="/auth/signup" className="text-[#0ff0fc] hover:text-glow-cyan font-medium transition-all hover:scale-105 inline-block mt-2">
              Sign up for free
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