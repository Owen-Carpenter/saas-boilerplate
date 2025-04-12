'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Key, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { setNewPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const router = useRouter();
  
  // Check if there's a valid recovery session
  useEffect(() => {
    async function checkSession() {
      setSessionLoading(true);
      try {
        // In URL hash parsing for recovery flow
        const hash = window.location.hash;
        const isRecoveryFlow = hash.includes('type=recovery');
        
        if (!isRecoveryFlow) {
          setError('Your password reset link is invalid or has expired. Please request a new link.');
          setValidSession(false);
          setSessionLoading(false);
          return;
        }
        
        // Get auth parameters from URL 
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (!accessToken) {
          setError('Missing authentication token. Your password reset link appears to be invalid.');
          setValidSession(false);
          setSessionLoading(false);
          return;
        }
        
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error || !data.session) {
          console.error('Error setting session:', error);
          setError('Your password reset link is invalid or has expired. Please request a new link.');
          setValidSession(false);
        } else {
          console.log('Valid recovery session established');
          setValidSession(true);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('An error occurred while validating your reset link.');
        setValidSession(false);
      } finally {
        setSessionLoading(false);
      }
    }
    
    checkSession();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate inputs
    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Update the password through Supabase directly since we have an active session
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Error updating password:', error);
        setError(error.message || 'Failed to update password. Please try again.');
        setLoading(false);
        return;
      }
      
      // Password update successful
      setSuccess(true);
      
      // Sign out to clear the recovery session
      await supabase.auth.signOut();
      
      // Redirect to login page after a few seconds
      setTimeout(() => {
        router.push('/auth/signin?reset=success');
      }, 3000);
    } catch (err) {
      console.error('Set new password error:', err);
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
          <h1 className="text-3xl font-bold mb-2 text-glow-cyan-strong">Set New Password</h1>
          {!success ? (
            <p className="text-gray-400">Create a new password for your account.</p>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-4 mt-4 flex items-start">
              <div className="mr-3 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <Check size={14} className="text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-emerald-500 text-sm">Password updated successfully</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Your password has been reset. Redirecting you to the login page...
                </p>
              </div>
            </div>
          )}
        </div>
        
        {sessionLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-[#0ff0fc] animate-spin" />
            <span className="ml-3 text-gray-400">Verifying your reset link...</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {validSession && !success ? (
              <div className="bg-[#0c1a29] border border-[#0ff0fc]/20 p-6 rounded-lg shadow-xl">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                        New Password
                      </label>
                      <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                        <Key size={18} className="text-[#0ff0fc]/80 mr-2" />
                        <input
                          type="password"
                          id="password"
                          className="flex-1 bg-transparent focus:outline-none text-white"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400">
                        Confirm New Password
                      </label>
                      <div className="flex items-center rounded-md border border-[#0ff0fc]/20 bg-[#0a1018] px-3 py-2">
                        <Key size={18} className="text-[#0ff0fc]/80 mr-2" />
                        <input
                          type="password"
                          id="confirmPassword"
                          className="flex-1 bg-transparent focus:outline-none text-white"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                          Updating...
                        </>
                      ) : (
                        "Set New Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (!success && (
              <div className="text-center mt-4">
                <Link 
                  href="/auth/forgot-password" 
                  className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-glow-cyan rounded-md hover:bg-[#0ff0fc]/30 inline-flex items-center"
                >
                  Request a new reset link
                </Link>
              </div>
            ))}
            
            {!success && (
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
          </>
        )}
      </div>
    </div>
  );
} 