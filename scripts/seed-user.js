// Simple seed script - creates database and user
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/docvault';

async function seedUser() {
  console.log('🔄 Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('docvault');
    const usersCollection = db.collection('users');

    // Create indexes
    await usersCollection.createIndex({ clerkId: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 });
    console.log('✅ Created indexes');

    // Check if any user exists
    const existingUser = await usersCollection.findOne({});

    if (existingUser) {
      console.log('✅ User already exists:', existingUser);
      return;
    }

    // Create a test admin user
    // You'll need to update clerkId after signing up in Clerk
    const testUser = {
      clerkId: 'pending_clerk_signup',
      email: 'admin@docvault.local',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Database "docvault" created');
    console.log('✅ Collection "users" created');
    console.log('✅ Admin user inserted with ID:', result.insertedId);

    console.log('\n📋 Next steps:');
    console.log('1. Refresh MongoDB Compass - you should see "docvault" database');
    console.log('2. After signing up in Clerk, get your User ID from Clerk Dashboard');
    console.log('3. Update the clerkId in MongoDB to match your Clerk User ID');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

seedUser();
