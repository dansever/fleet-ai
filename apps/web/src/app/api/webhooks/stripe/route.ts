// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure Node.js runtime for Stripe SDK + crypto
export const runtime = 'nodejs';
// Optional: avoid caching
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Use a real, current API version or omit to use your account default
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

export async function POST(request: NextRequest) {
  let body: string;
  let sig: string | null;

  try {
    // Stripe requires the raw body string for signature verification
    body = await request.text();
    sig = request.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Unable to read request body' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    // Do not stringify the whole error object to JSON; send message only
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', pi.id);
        // TODO: update DB, grant access, etc.
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        // TODO: fulfill order or set up subscription
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (handlerErr) {
    console.error('Error handling event:', handlerErr);
    // Respond 200 so Stripe doesn't retry forever if your handler logic fails,
    // but log and alert internally.
  }

  // Important: 2xx response tells Stripe you received the event
  return NextResponse.json({ received: true });
}
