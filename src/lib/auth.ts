import { supabase } from './supabase';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
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
          // Try to sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error('Supabase auth error:', error);
            return null;
          }

          if (data?.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              phone: data.user.user_metadata?.phone || '',
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function signUpWithEmailPassword(
  email: string, 
  password: string, 
  name?: string,
  phone?: string
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function signInWithEmailPassword(email: string, password: string) {
  try {
    // Sign out first to clear any existing session that might be in an inconsistent state
    await supabase.auth.signOut();
    
    // Try to sign in with Supabase directly
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Special handling for common errors
      if (error.message === 'Invalid login credentials') {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        };
      }
      
      // Check if the error is about email verification
      if (error.message?.toLowerCase().includes('email') && 
          error.message?.toLowerCase().includes('verify')) {
        return { 
          success: false, 
          error: 'Please verify your email before signing in. Check your inbox for the verification link.' 
        };
      }
      
      throw new Error(error.message);
    }

    // If we successfully signed in but the user doesn't have email_confirmed_at,
    // it means they still need to verify (though this shouldn't typically happen
    // as Supabase normally prevents sign in for unverified users)
    if (data?.user && !data.user.email_confirmed_at) {
      return { 
        success: false, 
        error: 'Please verify your email before signing in. Check your inbox for the verification link.' 
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Signin error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Updates user password and refreshes auth state
 */
export async function updatePassword(currentPassword: string, newPassword: string, email?: string) {
  try {
    // Use provided email or try to get from session
    let userEmail = email;
    
    // If no email was provided, try to get it from the Supabase session
    if (!userEmail) {
      const { data: sessionData } = await supabase.auth.getSession();
      userEmail = sessionData?.session?.user?.email;
      
      if (!userEmail) {
        return { 
          success: false, 
          error: 'No active session found. Please sign in again.' 
        };
      }
    }
    
    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });
    
    if (signInError) {
      return { 
        success: false, 
        error: 'Current password is incorrect' 
      };
    }
    
    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      return { 
        success: false, 
        error: updateError.message || 'Failed to update password' 
      };
    }
    
    // Success - password was changed
    return { 
      success: true, 
      message: 'Password updated successfully'
    };
  } catch (error) {
    console.error('Password update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Sends a password reset email to the specified email address
 */
export async function requestPasswordReset(email: string) {
  try {
    // Check if the email exists in the system
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      message: 'Password reset link sent to your email'
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Sets a new password after reset
 */
export async function setNewPassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      message: 'Password has been reset successfully' 
    };
  } catch (error) {
    console.error('Set new password error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Updates a user's profile information (name, phone, etc.)
 */
export async function updateUserProfile(userId: string, userData: { name?: string; phone?: string }) {
  try {
    // Update the user metadata in Supabase
    const { error } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      message: 'Profile updated successfully' 
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 