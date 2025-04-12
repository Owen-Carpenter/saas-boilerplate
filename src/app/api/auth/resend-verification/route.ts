import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Call Supabase to resend verification email
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('Error resending verification email:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { message: 'Verification email sent' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error when resending verification:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 