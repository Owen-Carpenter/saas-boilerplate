import { NextResponse } from 'next/server';
import { generateUuidFromEmail } from '@/lib/utils';
import { createServerClient } from '@/lib/supabase';

// This endpoint is for testing the UUID generation
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || 'test@example.com';
    
    // Generate UUID from the email
    const uuid = generateUuidFromEmail(email);
    
    // Test inserting into Supabase (will fail if invalid UUID)
    const supabase = createServerClient();
    
    // Try to insert with this UUID to test if it's valid
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: uuid,
          plan: 'test',
          status: 'test',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    
    return NextResponse.json({
      email,
      uuid,
      validFormat: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid),
      dbError: error ? error.message : null,
      success: !error
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 