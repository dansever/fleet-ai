import { createUser, deleteUser } from '@/db/core/users/db-actions';
import { serverEnv } from '@/lib/env/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clerkId = searchParams.get('clerkId');
  const clerkOrgId = searchParams.get('clerkOrgId');

  if (!clerkId || !clerkOrgId) {
    return NextResponse.json({ error: 'Missing clerkId or clerkOrgId' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing SVIX headers');
    return new Response('Error -- missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(serverEnv.CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Unauthorized', { status: 401 });
  }

  // Process events
  switch (event.type) {
    case 'user.created': {
      console.log(
        'New Clerk user created: ',
        event.data.id,
        "\nInserting new user to 'users' in Neon...",
      );
      const orgId = event.data.organization_memberships?.[0]?.organization.id;
      await createUser({
        clerkUserId: event.data.id,
        displayName: `${event.data.first_name} ${event.data.last_name}`,
        email: event.data.email_addresses[0].email_address,
        orgId: orgId ?? '',
      });
      break;
    }
    case 'user.deleted': {
      if (event.data.id != null) {
        await deleteUser(event.data.id);
      }
    }
  }
  return new Response('Webhook received', { status: 200 });
}
