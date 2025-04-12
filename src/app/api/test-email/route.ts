import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Ensure user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to send a test email' },
        { status: 401 }
      );
    }

    // Send a test email to the logged-in user
    const result = await sendTestEmail(session.user.email);
    
    if (!result.success) {
      console.error('Failed to send test email:', result.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          details: result.error,
          apiKey: process.env.RESEND_API_KEY ? 'API key is set' : 'API key is missing'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${session.user.email}`,
      data: result.data
    });
  } catch (error) {
    console.error('Error in test email API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
} 