'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function SignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/' });
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
        <div className="bg-[#0c1a29] p-8 rounded-lg border border-[#0ff0fc]/20 shadow-lg w-full max-w-md animate-fade-in text-center">
          <div className="w-20 h-20 bg-[#0ff0fc]/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-[#0ff0fc]/30">
            <svg className="h-10 w-10 text-[#0ff0fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-3 text-glow-cyan-strong">Sign out of your account</h1>
          <p className="text-gray-300 mb-8">Are you sure you want to sign out?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard" className="py-3 border border-[#0ff0fc]/30 rounded-md transition-all hover:bg-[#0ff0fc]/10 hover:text-glow-cyan hover:border-[#0ff0fc] font-medium">
              Cancel
            </Link>
            <button
              onClick={handleSignOut}
              className="py-3 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan-strong rounded-md transition-all hover:bg-[#0ff0fc]/30 hover:scale-105 font-medium flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0ff0fc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing out...
                </>
              ) : 'Sign out'}
            </button>
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