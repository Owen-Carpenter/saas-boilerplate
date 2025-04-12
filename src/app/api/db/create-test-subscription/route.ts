import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

// This endpoint is for testing subscription creation
export async function GET(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    // Get the URL parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const plan = url.searchParams.get('plan') || 'pro';
    
    // If no userId provided, try to get from session
    let finalUserId = userId;
    if (!finalUserId) {
      const session = await getServerSession();
      console.log('Session:', JSON.stringify(session, null, 2));
      
      if (session?.user) {
        // Try to get user ID from session
        finalUserId = session.user.id || null;
        
        // If not available, use email as a fallback identifier
        if (!finalUserId && session.user.email) {
          finalUserId = session.user.email;
        }
      }
    }
    
    // If still no userId, require it
    if (!finalUserId) {
      return NextResponse.json(
        { error: 'userId is required as a query parameter or from session' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Create a test subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: finalUserId,
          plan: plan,
          status: 'active',
          stripe_customer_id: `test_customer_${Date.now()}`,
          stripe_subscription_id: `test_subscription_${Date.now()}`,
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select();
    
    if (error) {
      console.error('Error creating test subscription:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create test subscription',
          details: error
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Created test subscription for user ${finalUserId}`,
      subscription: data[0]
    });
  } catch (error) {
    console.error('Error creating test subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create test subscription', details: error },
      { status: 500 }
    );
  }
} 