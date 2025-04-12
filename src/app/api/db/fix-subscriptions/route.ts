import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateUuidFromEmail } from '@/lib/utils';

// This endpoint is for fixing any invalid subscription data
export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerClient();
    
    // First check if we need to create the table
    const { error: checkError } = await supabase
      .from('user_subscriptions')
      .select('count(*)')
      .limit(1);
    
    let tableCreated = false;
    if (checkError) {
      console.log('Table does not exist, creating it');
      
      // Create the table with necessary columns
      const { error: createError } = await supabase.rpc('create_table', {
        table_sql: `
          CREATE TABLE IF NOT EXISTS public.user_subscriptions (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            plan VARCHAR(50) DEFAULT 'free' NOT NULL,
            status VARCHAR(50) DEFAULT 'active' NOT NULL,
            stripe_customer_id VARCHAR(255),
            stripe_subscription_id VARCHAR(255),
            current_period_end BIGINT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
          ON public.user_subscriptions(user_id);
          
          CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id 
          ON public.user_subscriptions(stripe_customer_id);
        `
      });
      
      if (createError) {
        console.error('Failed to create table:', createError);
        tableCreated = false;
      } else {
        tableCreated = true;
      }
    }
    
    // Try to create a test subscription
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        message: 'Table exists or was created',
        tableCreated,
        hint: 'Pass email parameter to test with a specific email'
      });
    }
    
    // Generate a proper UUID from the email
    const uuid = generateUuidFromEmail(email);
    
    // Create a test subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: uuid,
          plan: 'free',
          status: 'active',
          stripe_customer_id: email,
          stripe_subscription_id: `test_${Date.now()}`,
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select();
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Created test subscription with proper UUID',
      uuid,
      email,
      subscription: data[0]
    });
  } catch (error: any) {
    console.error('Error fixing subscriptions:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 