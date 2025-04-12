import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateUuidFromEmail } from '@/lib/utils';

// Check if Stripe API key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with a more flexible API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // Using type assertion to bypass the version check
});

// For development mode, we'll use a hardcoded product/price approach
// In production, replace these with actual price IDs from your Stripe dashboard
const createPrice = async (productName: string, amount: number): Promise<string> => {
  try {
    // First create a product if it doesn't exist
    const productResponse = await stripe.products.list({
      limit: 1,
    });
    
    let productId;
    // Find product by name since we can't filter by name in the API
    const existingProduct = productResponse.data.find(p => p.name === productName && p.active !== false);
    
    if (existingProduct) {
      // Use existing product
      productId = existingProduct.id;
      console.log(`Using existing product: ${productId}`);
    } else {
      // Create new product
      const newProduct = await stripe.products.create({
        name: productName,
        active: true,
      });
      productId = newProduct.id;
      console.log(`Created new product: ${productId}`);
    }
    
    // Now create a price for this product
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: amount * 100, // Convert dollars to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      }
    });
    
    console.log(`Created price: ${price.id} for product: ${productId}`);
    return price.id;
  } catch (error) {
    console.error('Error creating Stripe price:', error);
    throw error;
  }
};

// Initialize price IDs
let PRICE_IDS = {
  free: 'price_FREE', // This is a placeholder, there's no charge for the free plan
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

// Print out the price IDs for debugging
console.log('Environment Pro Price ID:', PRICE_IDS.pro);
console.log('Environment Enterprise Price ID:', PRICE_IDS.enterprise);

export async function GET(request: Request) {
  try {
    // Get plan from URL query parameter
    const url = new URL(request.url);
    const plan = url.searchParams.get('plan');
    
    console.log('Requested plan via GET:', plan);
    const session = await getServerSession(authOptions);
    console.log('User session:', session ? 'Valid' : 'Not Found');
    
    // If there's no user session and trying to subscribe to a paid plan, redirect to login
    if (!session?.user && plan !== 'free') {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      );
    }

    // Validate the plan
    if (!plan || !['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Handle free plan - just redirect to dashboard
    if (plan === 'free') {
      return NextResponse.json({ 
        url: '/dashboard',
        message: 'Free plan activated'
      });
    }

    // Dynamically create prices for development (remove this in production)
    if (plan === 'pro' && (!PRICE_IDS.pro || PRICE_IDS.pro === '')) {
      PRICE_IDS.pro = await createPrice('Pro Plan', 20);
    } else if (plan === 'enterprise' && (!PRICE_IDS.enterprise || PRICE_IDS.enterprise === '')) {
      PRICE_IDS.enterprise = await createPrice('Enterprise Plan', 100);
    }

    // Get price ID for the selected plan
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    console.log(`Using price ID for ${plan}:`, priceId);
    
    if (!priceId || priceId === '') {
      console.error(`Invalid or missing price ID for ${plan}: ${priceId}`);
      return NextResponse.json(
        { error: `Could not create or find a valid price ID for ${plan}. Please check your Stripe configuration.` },
        { status: 400 }
      );
    }

    // Construct checkout options - fixing TypeScript type issues
    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: session?.user?.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session?.user?.id || (session?.user?.email ? generateUuidFromEmail(session.user.email) : ''),
        plan: plan,
      },
    };
    
    console.log('Creating checkout session with options:', JSON.stringify({
      ...checkoutOptions,
      customer_email: checkoutOptions.customer_email ? '[REDACTED]' : undefined,
    }));

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutOptions);
    console.log('Checkout session created successfully:', checkoutSession.id);

    return NextResponse.json({ 
      sessionId: checkoutSession.id, 
      url: checkoutSession.url 
    });
    
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error creating checkout session';
    let statusCode = 500;
    
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = `Stripe error: ${error.message}`;
      
      // Map specific Stripe errors to appropriate status codes
      if (error.type === 'StripeCardError') statusCode = 400;
      if (error.type === 'StripeInvalidRequestError') statusCode = 400;
      if (error.type === 'StripeAuthenticationError') statusCode = 401;
      if (error.type === 'StripeRateLimitError') statusCode = 429;
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.stack },
      { status: statusCode }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Clone the request to avoid the "already used" error when reading body multiple times
    const requestClone = request.clone();
    const body = await requestClone.json();
    const { plan } = body;
    
    console.log('Requested plan via POST:', plan);
    const session = await getServerSession(authOptions);
    console.log('User session:', session ? 'Valid' : 'Not Found');
    
    // If there's no user session and trying to subscribe to a paid plan, redirect to login
    if (!session?.user && plan !== 'free') {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      );
    }

    // Validate the plan
    if (!plan || !['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Handle free plan - just redirect to dashboard
    if (plan === 'free') {
      return NextResponse.json({ 
        url: '/dashboard',
        message: 'Free plan activated'
      });
    }

    // Dynamically create prices for development (remove this in production)
    if (plan === 'pro' && (!PRICE_IDS.pro || PRICE_IDS.pro === '')) {
      PRICE_IDS.pro = await createPrice('Pro Plan', 20);
    } else if (plan === 'enterprise' && (!PRICE_IDS.enterprise || PRICE_IDS.enterprise === '')) {
      PRICE_IDS.enterprise = await createPrice('Enterprise Plan', 100);
    }

    // Get price ID for the selected plan
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    console.log(`Using price ID for ${plan}:`, priceId);
    
    if (!priceId || priceId === '') {
      console.error(`Invalid or missing price ID for ${plan}: ${priceId}`);
      return NextResponse.json(
        { error: `Could not create or find a valid price ID for ${plan}. Please check your Stripe configuration.` },
        { status: 400 }
      );
    }

    // Construct checkout options - fixing TypeScript type issues
    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: session?.user?.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session?.user?.id || (session?.user?.email ? generateUuidFromEmail(session.user.email) : ''),
        plan: plan,
      },
    };
    
    console.log('Creating checkout session with options:', JSON.stringify({
      ...checkoutOptions,
      customer_email: checkoutOptions.customer_email ? '[REDACTED]' : undefined,
    }));

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutOptions);
    console.log('Checkout session created successfully:', checkoutSession.id);

    return NextResponse.json({ 
      sessionId: checkoutSession.id, 
      url: checkoutSession.url 
    });
    
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error creating checkout session';
    let statusCode = 500;
    
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = `Stripe error: ${error.message}`;
      
      // Map specific Stripe errors to appropriate status codes
      if (error.type === 'StripeCardError') statusCode = 400;
      if (error.type === 'StripeInvalidRequestError') statusCode = 400;
      if (error.type === 'StripeAuthenticationError') statusCode = 401;
      if (error.type === 'StripeRateLimitError') statusCode = 429;
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.stack },
      { status: statusCode }
    );
  }
} 