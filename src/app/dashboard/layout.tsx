'use client';

import { ReactNode, useState, useEffect, Suspense, lazy } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary';

// Lazy load the Sidebar component
const Sidebar = lazy(() => import('@/components/dashboard/Sidebar'));

// Loading fallback for Sidebar
const SidebarFallback = () => (
  <div className="fixed h-screen w-64 bg-[#0c1a29] border-r border-[#0ff0fc]/10 flex flex-col z-40">
    <div className="p-6 border-b border-[#0ff0fc]/10 flex items-center justify-between">
      <div className="h-8 w-32 bg-[#0c1a29] animate-pulse rounded-md"></div>
    </div>
    <div className="flex-1 p-4">
      <div className="space-y-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-[#0c1a29] animate-pulse rounded-md"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when screen resizes to larger than mobile view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle opening the sidebar
  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Handle closing the sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ErrorBoundary>
      <div className="bg-[#0c1220] min-h-screen text-white flex flex-col relative">
        {/* Background elements */}
        <div className="fixed top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
        <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#0ff0fc]/5 filter blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-[#0ff0fc]/10 filter blur-3xl pointer-events-none"></div>
        
        {/* Floating particles */}
        <div className="fixed bottom-[10%] right-[10%] w-3 h-3 rounded-full bg-[#0ff0fc]/20 animate-float border border-[#0ff0fc]/30 pointer-events-none" style={{ animationDuration: "10s" }}></div>
        <div className="fixed top-[30%] right-[20%] w-2 h-2 rounded-full bg-[#0ff0fc]/30 animate-float border border-[#0ff0fc]/40 pointer-events-none" style={{ animationDuration: "7s", animationDelay: "1s" }}></div>
        
        {/* Fixed sidebar container */}
        <div className="fixed top-0 left-0 h-full md:w-64 z-40">
          {/* Sidebar with Suspense and ErrorBoundary */}
          <ErrorBoundary>
            <Suspense fallback={<SidebarFallback />}>
              <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
            </Suspense>
          </ErrorBoundary>
        </div>
        
        {/* Main Content - shifted to leave space for the sidebar */}
        <div className="w-full md:pl-64 flex flex-col min-h-screen">
          <DashboardHeader onOpenSidebar={handleOpenSidebar} />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
} 