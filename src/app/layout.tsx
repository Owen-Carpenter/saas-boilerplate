import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from '@/components/AuthSessionProvider';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'SaaS Boilerplate',
  description: 'A modern SaaS boilerplate with Next.js, Tailwind CSS, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthSessionProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
