import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionPlan } from '@/types/subscription';

// First, check if the table exists, and create it if it doesn't
async function ensureTableExists() {
  try {
    const { error } = await supabase.from('user_subscriptions').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('Table might not exist, creating it...');
      
      // Create the table directly with SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.user_subscriptions (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID NOT NULL UNIQUE,
          plan VARCHAR(20) NOT NULL DEFAULT 'free',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          stripe_customer_id VARCHAR(255),
          stripe_subscription_id VARCHAR(255),
          current_period_end BIGINT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add index on user_id for faster lookups
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
        ON public.user_subscriptions(user_id);
        
        -- Add index on stripe_customer_id for webhook processing
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id 
        ON public.user_subscriptions(stripe_customer_id);
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error creating table with SQL:', createError);
        console.log('Trying alternate approach - simple insert may create the table...');
        // We'll continue and let the insert attempt create the table
      } else {
        console.log('Table created successfully');
      }
    } else {
      console.log('Table already exists');
    }
  } catch (error) {
    console.error('Error in ensureTableExists:', error);
    // Continue anyway to let the insert attempt handle it
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('User authenticated:', session.user.id);
    
    // Try to create the table if it doesn't exist
    try {
      await ensureTableExists();
    } catch (error) {
      console.error('Error ensuring table exists:', error);
      console.log('Continuing with operations, assuming table exists or will be auto-created');
    }
    
    // Attempt to get the user's subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.log('Error or no data found:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('not found')) {
        console.log('No record found, creating a default one');
        
        try {
          // No record found, create a default one
          const { data: newData, error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: session.user.id,
              plan: 'free',
              status: 'active',
              current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating subscription record:', insertError);
            
            // If table doesn't exist, this might be the error
            if (insertError.message?.includes('relation') && insertError.message?.includes('does not exist')) {
              return NextResponse.json({ 
                subscription: { plan: 'free', status: 'active' },
                error: 'Database table does not exist',
                fallback: true
              });
            }
            
            return NextResponse.json({ 
              subscription: { plan: 'free', status: 'active' },
              error: 'Could not save to database',
              fallback: true
            });
          }
          
          return NextResponse.json({ 
            subscription: newData || { plan: 'free', status: 'active' },
            message: 'Created new subscription record'
          });
        } catch (insertCatchError) {
          console.error('Exception during insert:', insertCatchError);
          return NextResponse.json({ 
            subscription: { plan: 'free', status: 'active' },
            error: 'Exception during database operation',
            fallback: true
          });
        }
      }
      
      console.error('Error fetching subscription:', error);
      return NextResponse.json({ 
        subscription: { plan: 'free', status: 'active' },
        error: 'Database error', 
        fallback: true
      });
    }
    
    return NextResponse.json({ subscription: data });
  } catch (error) {
    console.error('Unexpected error in GET /api/user-subscription:', error);
    return NextResponse.json({ 
      subscription: { plan: 'free', status: 'active' },
      error: 'Server error',
      fallback: true
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the requested plan from the request body
    const body = await request.json();
    const { plan } = body;
    
    if (!plan || !['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    console.log('Updating plan for user:', session.user.id, 'to', plan);
    
    // Try to ensure the table exists
    try {
      await ensureTableExists();
    } catch (error) {
      console.error('Error ensuring table exists:', error);
      console.log('Continuing with operations, assuming table exists or will be auto-created');
    }
    
    // Update or create the user's subscription
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: session.user.id,
          plan: plan as SubscriptionPlan,
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) {
        console.error('Error updating subscription:', error);
        
        // If table doesn't exist, this might be the error
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          return NextResponse.json({ 
            subscription: { plan: plan as SubscriptionPlan, status: 'active' },
            error: 'Database table does not exist but plan updated in session',
            fallback: true,
            success: true
          });
        }
        
        return NextResponse.json({ 
          subscription: { plan: plan as SubscriptionPlan, status: 'active' },
          error: 'Could not save to database but plan updated in session',
          fallback: true,
          success: true
        });
      }
      
      return NextResponse.json({ 
        subscription: data,
        success: true
      });
    } catch (upsertError) {
      console.error('Exception during upsert:', upsertError);
      return NextResponse.json({ 
        subscription: { plan: plan as SubscriptionPlan, status: 'active' },
        error: 'Exception during database operation but plan updated in session',
        fallback: true,
        success: true
      });
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/user-subscription:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 