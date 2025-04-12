'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Next.js App Router requires client components to use context providers
// This wrapper allows us to use the SessionProvider from next-auth in a server component
export default function AuthSessionProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
} 