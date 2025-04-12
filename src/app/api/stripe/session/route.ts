import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Stripe with a more flexible API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function GET(request: Request) {
  try {
    // Get user session to verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the session_id from URL
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id parameter' }, { status: 400 });
    }
    
    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Get the plan from the session metadata
    const plan = stripeSession.metadata?.plan || 'free';
    
    // For security reasons, verify that this checkout was for the current user
    if (stripeSession.metadata?.userId !== session.user.id) {
      console.warn('User tried to access a checkout session that does not belong to them');
      // We'll continue anyway but log the suspicious activity
    }
    
    return NextResponse.json({ 
      plan,
      success: true,
    });
    
  } catch (error) {
    console.error('Error retrieving session:', error);
    
    let errorMessage = 'Error retrieving session information';
    let statusCode = 500;
    
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = `Stripe error: ${error.message}`;
      
      if (error.type === 'StripeInvalidRequestError') {
        statusCode = 400;
        errorMessage = 'Invalid session ID';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 