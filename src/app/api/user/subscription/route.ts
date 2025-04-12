import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createServerClient } from '@/lib/supabase';
import { generateUuidFromEmail } from '@/lib/utils';
import { authOptions } from '@/lib/auth';

// Default subscription for free users
const defaultSubscription = {
  id: 0,
  user_id: "",
  plan: "free",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export async function GET(request: Request) {
  try {
    // Initialize the Supabase client
    const supabase = createServerClient();
    
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('Subscription API: No authenticated session found');
      // Return a better error response that the frontend can understand
      return NextResponse.json(
        { 
          error: "Not authenticated",
          subscription: defaultSubscription, 
          authStatus: "unauthenticated" 
        },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate'
          }
        }
      );
    }

    // Log session details for debugging
    console.log('Session in subscription API:', {
      id: session?.user?.id || 'no-id',
      email: session?.user?.email,
      name: session?.user?.name || 'no-name',
      hasSession: true
    });
    
    // Get user ID from session or generate a UUID from email
    const userId = session.user.id || generateUuidFromEmail(session.user.email);
    console.log('Using userId:', userId);
    
    // Try to get subscription by user ID first
    let { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If not found, try by email
    if (error && session.user.email) {
      console.log('Not found by ID, trying by email');
      const { data: emailSubscription, error: emailError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.email)
        .single();
        
      if (!emailError && emailSubscription) {
        console.log('Found subscription by email');
        subscription = emailSubscription;
        error = null;
      }
    }

    if (error) {
      console.log('Error fetching subscription:', error.message);
      
      // Return a default free subscription if there's an error
      const defaultWithUserId = {
        ...defaultSubscription,
        user_id: userId
      };
      
      // If not found, it's not really an error in our case
      if (error.code === 'PGRST116') {
        console.log('No subscription found, creating a default free one');
        
        // Create a default subscription for the user
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan: 'free',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating default subscription:', insertError);
        }
      }
      
      return NextResponse.json(
        { 
          subscription: defaultWithUserId, 
          fallback: true, 
          error: error.message,
          errorCode: error.code
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate'
          }
        }
      );
    }

    if (!subscription) {
      // If no subscription exists, create a default free one
      const defaultWithUserId = {
        ...defaultSubscription,
        user_id: userId
      };
      
      console.log('No subscription found, using default');
      
      // Try to create a default subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan: 'free',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error creating default subscription:', insertError);
      }
      
      return NextResponse.json(
        { subscription: defaultWithUserId, new: true },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate'
          }
        }
      );
    }

    return NextResponse.json(
      { subscription }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in subscription API:', errorMessage);
    
    return NextResponse.json(
      { 
        subscription: defaultSubscription, 
        fallback: true, 
        error: errorMessage 
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
  }
} 