'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('There was a problem with your request.');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams?.get('error');
    if (error) {
      setErrorType(error);
      
      // Set appropriate error message based on error type
      switch(error) {
        case 'CredentialsSignin':
          setErrorMessage('Failed to sign in. Please check your email and password.');
          break;
        case 'SessionRequired':
          setErrorMessage('You need to be signed in to access this page.');
          break;
        case 'AccessDenied':
          setErrorMessage('You do not have permission to access this resource.');
          break;
        case 'Verification':
          setErrorMessage('Email verification failed. The link may have expired.');
          break;
        case 'Configuration':
          setErrorMessage('There is a problem with the server configuration. Please try again later.');
          break;
        default:
          // Try to extract any error message from the URL if it exists
          const specificError = searchParams?.get('message');
          if (specificError) {
            setErrorMessage(decodeURIComponent(specificError));
          }
          break;
      }
    }
  }, [searchParams]);

  // Handler to go back to previous page
  const goBack = () => {
    router.back();
  };

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
        <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/20 shadow-lg w-full max-w-md animate-fade-in">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-center text-red-400">Authentication Error</h1>
          <p className="text-gray-300 mb-6 text-center">{errorMessage}</p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={goBack}
              className="py-3 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong rounded-md transition-all hover:bg-[#0ff0fc]/30 hover:scale-[1.02] font-medium"
            >
              Go Back
            </button>
            <Link href="/auth/signin" className="py-3 border border-gray-600 text-gray-300 text-center rounded-md transition-all hover:border-gray-400 hover:text-white">
              Sign In
            </Link>
            <Link href="/auth/signup" className="py-3 border border-gray-600 text-gray-300 text-center rounded-md transition-all hover:border-gray-400 hover:text-white">
              Create New Account
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