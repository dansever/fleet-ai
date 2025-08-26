import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

export async function POST(request: NextRequest) {
  // Retrieve raw body as text
  const body = await request.text();

  // Extract Stripe signature from headers
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    // Verify signature and construct event
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: `Webhook Error: ${err}` }, { status: 400 });
  }

  // Handle relevant event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // Insert post-payment logic here (e.g., update DB, sync user access)
      break;
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id);
      // Handle order fulfillment or subscription setup
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
