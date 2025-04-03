import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { resetIngresses } from '@/actions/ingress';

export async function POST(req: Request) {
  // Validate webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET in environment variables');
  }

  // Get and validate headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing required Svix headers', {
      status: 400
    });
  }

  // Get and parse request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Initialize webhook verifier
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', {
      status: 400
    });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created":
        await db.user.create({
          data: {
            externalUserId: payload.data.id,
            username: payload.data.username,
            imageUrl: payload.data.image_url,
            bio: "", // Added required bio field with empty string default
            stream: {
              create: {
                name: `${payload.data.username}'s stream`
              }
            }
          }
        });
        break;

      case "user.updated":
        const currentUser = await db.user.findUnique({
          where: {
            externalUserId: payload.data.id
          }
        });

        if (!currentUser) {
          return new Response('User not found', {
            status: 404
          });
        }

        await db.user.update({
          where: {
            externalUserId: payload.data.id
          },
          data: {
            username: payload.data.username,
            imageUrl: payload.data.image_url,
          }
        });
        break;

      case "user.deleted":
        await resetIngresses(payload.data.id);
        await db.user.delete({
          where: {
            externalUserId: payload.data.id,
          }
        });
        break;

      default:
        return new Response(`Unhandled event type: ${eventType}`, {
          status: 400
        });
    }

    return new Response('Webhook processed successfully', { 
      status: 200 
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal server error', { 
      status: 500 
    });
  }
}