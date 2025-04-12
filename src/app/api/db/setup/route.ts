import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// This endpoint is for development only
// In production, you would use Supabase migrations
export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Check if table already exists
    const { error: checkError } = await supabase
      .from('user_subscriptions')
      .select('count(*)')
      .limit(1);
    
    if (checkError) {
      console.log('Table does not exist, creating it');
      
      // Create the table with necessary columns
      const { error: createError } = await supabase.rpc('create_table', {
        table_sql: `
          CREATE TABLE IF NOT EXISTS public.user_subscriptions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
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
        
        // Fallback message
        return NextResponse.json({
          error: 'Failed to create table',
          details: createError,
          message: 'To create the table manually, run the SQL in the src/db/ensure_user_subscriptions.sql file in the Supabase SQL editor'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Created user_subscriptions table'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'user_subscriptions table already exists'
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set up database', 
        details: error,
        message: 'Please run the SQL in src/db/ensure_user_subscriptions.sql manually in the Supabase SQL editor'
      },
      { status: 500 }
    );
  }
} 