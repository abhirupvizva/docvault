import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, updateUserByClerkId, deleteUserByClerkId } from '@/lib/models/user.model'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    console.error('Webhook verification failed')
    return new Response('Invalid signature', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const primaryEmail = email_addresses[0]?.email_address

    if (primaryEmail) {
      await createUser({
        clerkId: id,
        email: primaryEmail,
        firstName: first_name ?? undefined,
        lastName: last_name ?? undefined,
        imageUrl: image_url ?? undefined,
        role: 'user',
      })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const primaryEmail = email_addresses[0]?.email_address

    await updateUserByClerkId(id, {
      email: primaryEmail,
      firstName: first_name ?? undefined,
      lastName: last_name ?? undefined,
      imageUrl: image_url ?? undefined,
    })
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    if (id) {
      await deleteUserByClerkId(id)
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
