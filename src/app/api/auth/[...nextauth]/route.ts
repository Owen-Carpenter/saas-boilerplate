import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '@/lib/supabase';

// Check if Supabase is configured correctly
const isSupabaseConfigured = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Only attempt Supabase auth if it's configured
          if (!isSupabaseConfigured()) {
            console.warn('Supabase is not properly configured. Auth will not work correctly.');
            
            // For development, you might want to allow a test user
            if (process.env.NODE_ENV === 'development') {
              if (credentials.email === 'test@example.com' && credentials.password === 'password') {
                return {
                  id: '1',
                  email: 'test@example.com',
                  name: 'Test User',
                };
              }
            }
            
            return null;
          }
          
          // Try to sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error('Supabase auth error:', error);
            
            // Check if the error is due to email not being confirmed
            if (error.message?.toLowerCase().includes('email') && error.message?.toLowerCase().includes('confirm')) {
              // User needs to confirm email
              throw new Error('Please confirm your email before signing in. Check your inbox for the verification link.');
            }
            
            // Handle invalid login credentials
            if (error.message === 'Invalid login credentials') {
              // Since we can't directly check if a user exists with just the email,
              // we'll check if this is likely a valid user with wrong password
              // or a user that doesn't exist
              
              // Try to get the user by checking the 'users' table
              const { data: userExists } = await supabase
                .from('users')
                .select('email')
                .eq('email', credentials.email)
                .single();
              
              if (userExists) {
                // User exists, so password is wrong
                throw new Error('Incorrect password. Please try again or reset your password.');
              } else {
                // User doesn't exist
                throw new Error('No account found with this email. Please sign up first.');
              }
            }
            
            // Default fallback
            throw new Error(error.message || 'Authentication failed');
          }

          if (data?.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          // Re-throw custom errors
          if (error instanceof Error) {
            throw error;
          }
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 