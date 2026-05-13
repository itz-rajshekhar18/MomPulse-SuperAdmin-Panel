/**
 * Script to create admin user in Firebase
 * Run with: node scripts/create-admin.js
 * 
 * This script creates:
 * 1. Firebase Authentication user: admin@mompulse.com / admin_mompulse
 * 2. Firestore document in 'admins' collection with admin metadata
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Make sure you have downloaded your service account key from Firebase Console
// Place it in the root directory as 'serviceAccountKey.json'
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error: Could not find serviceAccountKey.json');
  console.error('Please download your service account key from Firebase Console:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Save it as "serviceAccountKey.json" in the root directory');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const ADMIN_EMAIL = 'admin@mompulse.com';
const ADMIN_PASSWORD = 'admin_mompulse';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Create Firebase Authentication user
    const userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Super Admin',
    });

    console.log('✓ Firebase Auth user created:', userRecord.uid);

    // Create admin document in Firestore
    const adminData = {
      email: ADMIN_EMAIL,
      role: 'super_admin',
      displayName: 'Super Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      permissions: [
        'manage_users',
        'manage_admins',
        'view_analytics',
        'manage_settings',
        'manage_content',
      ],
    };

    await db.collection('admins').doc(userRecord.uid).set(adminData);

    console.log('✓ Firestore admin document created');
    console.log('\n✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
