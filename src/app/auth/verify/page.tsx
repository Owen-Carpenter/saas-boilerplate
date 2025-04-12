'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function verifyEmail() {
      try {
        // Get the token and type from URL parameters
        const token = searchParams?.get('token');
        const type = searchParams?.get('type');
        const userEmail = searchParams?.get('email');
        
        if (userEmail) {
          setEmail(userEmail);
        }
        
        if (!token || type !== 'email_confirmation') {
          setStatus('error');
          setMessage('Invalid verification link. Please try signing in or request a new verification email.');
          return;
        }

        // Sign out first to ensure a clean state
        await supabase.auth.signOut();
        
        // Use Supabase's verification method to confirm email
        const { error, data } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage('Failed to verify email: ' + error.message);
          return;
        }

        // Success!
        setStatus('success');
        setMessage('Your email has been verified successfully! Please sign in to continue.');
        
        // Extract the email from the verification data or use the one from params
        const verifiedEmail = data?.user?.email || userEmail;
        
        // Redirect to sign in page after a brief delay
        setTimeout(() => {
          const redirectUrl = verifiedEmail 
            ? `/auth/signin?verified=true&email=${encodeURIComponent(verifiedEmail)}`
            : '/auth/signin?verified=true';
          
          router.push(redirectUrl);
        }, 3000);
      } catch (err) {
        console.error('Verification process error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred during verification. Please try signing in directly.');
      }
    }

    verifyEmail();
  }, [searchParams, router]);

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
        </header>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/20 shadow-lg w-full max-w-md animate-fade-in text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin mr-2 h-8 w-8 text-[#0ff0fc]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold mt-4 text-glow-cyan-strong">{message}</h2>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#0ff0fc]/20 border border-[#0ff0fc] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0ff0fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-4 text-glow-cyan-strong">Email Verified!</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              <Link 
                href={email ? `/auth/signin?verified=true&email=${encodeURIComponent(email)}` : "/auth/signin?verified=true"}
                className="w-full py-3 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong rounded-md transition-all hover:bg-[#0ff0fc]/30 hover:scale-[1.02] font-medium inline-block"
              >
                Sign In Now
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-4 text-red-400">Verification Failed</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="flex flex-col space-y-3">
                <Link href="/auth/signin" className="py-3 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong rounded-md transition-all hover:bg-[#0ff0fc]/30 hover:scale-[1.02] font-medium">
                  Try Signing In
                </Link>
                <Link href="/auth/signup" className="py-3 border border-gray-600 text-gray-300 rounded-md transition-all hover:border-gray-400 hover:text-white">
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute bottom-[20%] left-[30%] w-3 h-3 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30" style={{ animationDuration: "10s" }}></div>
      <div className="absolute top-[70%] right-[40%] w-2 h-2 rounded-full bg-[#0ff0fc]/30 animate-float border border-[#0ff0fc]/40" style={{ animationDuration: "7s", animationDelay: "1s" }}></div>
      <div className="absolute top-[20%] right-[20%] w-4 h-4 rounded-full bg-[#0ff0fc]/10 animate-float border border-[#0ff0fc]/20" style={{ animationDuration: "8s", animationDelay: "0.5s" }}></div>
    </div>
  );
} 