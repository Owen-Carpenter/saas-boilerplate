'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    try {
      const { success, error } = await requestPasswordReset(email);
      
      if (!success && error) {
        setError(error);
        setLoading(false);
        return;
      }
      
      // Success
      setSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0c1220] text-white flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] opacity-10 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#0ff0fc]/5 filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-[#0ff0fc]/10 filter blur-3xl"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-glow-cyan-strong">Reset Password</h1>
          {!success ? (
            <p className="text-gray-400">Enter your email address and we'll send you a link to reset your password.</p>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 mt-4 flex items-start">
              <div className="mr-3 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <Check size={14} className="text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-emerald-500 text-sm">Check your inbox</h3>
                <p className="text-gray-300 text-sm mt-1">
                  We've sent a password reset link to <span className="font-medium">{email}</span>. 
                  The link will expire in 24 hours.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {!success ? (
          <div className="bg-[#0c1a29] border border-[#0ff0fc]/20 p-6 rounded-lg shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                    Email address
                  </label>
                  <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                    <Mail size={18} className="text-[#0ff0fc]/80 mr-2" />
                    <input
                      type="email"
                      id="email"
                      className="flex-1 bg-transparent focus:outline-none text-white"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan rounded-md hover:bg-[#0ff0fc]/30 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin" 
              className="text-[#0ff0fc] hover:underline inline-flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Link>
          </div>
        )}
        
        {!success && (
          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin" 
              className="text-[#0ff0fc] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 