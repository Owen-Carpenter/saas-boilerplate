import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, updatePassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to change your password' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }
    
    // Validate password complexity
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Call the utility function to update password, passing the user's email from NextAuth session
    const result = await updatePassword(currentPassword, newPassword, session.user.email);
    
    if (!result.success) {
      // Return appropriate error response based on the error
      if (result.error === 'Current password is incorrect') {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: result.error || 'Failed to update password' },
        { status: 500 }
      );
    }
    
    // Password updated successfully
    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in change-password API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 