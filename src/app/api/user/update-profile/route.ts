import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to update your profile' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { name, phone } = body;
    
    // Validate inputs
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Update user metadata in Supabase
    const { error } = await supabase.auth.updateUser({
      data: {
        name,
        phone: phone || ''
      }
    });
    
    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    // User profile updated successfully
    return NextResponse.json(
      { success: true, message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in update-profile API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 