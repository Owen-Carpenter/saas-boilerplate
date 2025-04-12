'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0c1220] text-white p-8 flex flex-col items-center justify-center">
          <div className="p-8 bg-[#0c1a29] rounded-lg border border-[#0ff0fc]/20 max-w-md w-full text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Something went wrong</h1>
            <p className="text-gray-300 mb-6">We're having trouble loading this page. Please try refreshing or return to the dashboard.</p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#0ff0fc]/20 border border-[#0ff0fc] text-[#0ff0fc] rounded-md transition-all hover:bg-[#0ff0fc]/30"
              >
                Refresh Page
              </button>
              <Link href="/dashboard" className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md transition-all hover:border-gray-400 hover:text-white">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 