// Run this script with: npx tsx scripts/seed-user.ts
// This creates a test user in MongoDB for local development

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docvault'

async function seedUser() {
  console.log('Connecting to MongoDB...')
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' })

    if (existingUser) {
      console.log('User already exists:', existingUser)
      return
    }

    // Create a test user
    // Replace the clerkId with your actual Clerk user ID from Clerk Dashboard
    const testUser = {
      clerkId: 'user_REPLACE_WITH_YOUR_CLERK_USER_ID', // Get this from Clerk Dashboard > Users
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin', // Set to 'admin' to access admin dashboard
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(testUser)
    console.log('✅ User created with ID:', result.insertedId)
    console.log('User data:', testUser)

    console.log('\n📝 IMPORTANT: Update the clerkId to match your Clerk user ID!')
    console.log('   Find your Clerk user ID in: Clerk Dashboard > Users > Click your user > Copy "User ID"')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
    console.log('Connection closed')
  }
}

seedUser()
