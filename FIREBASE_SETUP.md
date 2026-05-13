# Firebase Setup Guide for MomPulse Super Admin Panel

## Overview
This guide will help you set up Firebase Authentication and Firestore for the MomPulse Super Admin Panel.

## Prerequisites
- Firebase project already created (mompulse-5ceb8)
- Node.js installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Environment Variables
The `.env.local` file has already been created with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=....
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=....
NEXT_PUBLIC_FIREBASE_PROJECT_ID=m....
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=m....
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=....
NEXT_PUBLIC_FIREBASE_APP_ID=1:....
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G.....
```

## Step 2: Download Service Account Key
To create the admin user programmatically, you need a Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (mompulse-5ceb8)
3. Click ⚙️ (Settings) → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the downloaded JSON file as `serviceAccountKey.json` in the root directory

⚠️ **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (already done)

## Step 3: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

## Step 4: Create Admin User
Run the setup script to create the admin user:

```bash
node scripts/create-admin.js
```

This will create:
- **Firebase Auth User**: admin@mompulse.com / admin_mompulse
- **Firestore Document**: In `admins` collection with admin metadata

### Expected Output:
```
Creating admin user...
✓ Firebase Auth user created: [uid]
✓ Firestore admin document created

✅ Admin user created successfully!

Login credentials:
Email: admin@mompulse.com
Password: admin_mompulse

⚠️  Please change the password after first login!
```

## Step 5: Configure Firestore Security Rules
In Firebase Console, set up Firestore security rules:

1. Go to Firestore Database → Rules
2. Replace with these rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin collection - only authenticated admins can access
    match /admins/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.uid != null && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Logs collection - admins can read
    match /logs/{document=**} {
      allow read: if request.auth.uid != null && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
      allow write: if false;
    }
  }
}
```

## Step 6: Enable Authentication Methods
In Firebase Console:

1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. Optionally enable "Google" for additional security

## Step 7: Test the Login
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Login with:
   - Email: `admin@mompulse.com`
   - Password: `admin_mompulse`

## File Structure
```
mompulse-super-admin-panel/
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   └── auth.ts              # Authentication functions
├── components/
│   ├── LoginForm.tsx        # Login form with Firebase integration
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Icons.tsx
├── scripts/
│   └── create-admin.js      # Script to create admin user
├── .env.local               # Firebase config (public keys only)
├── serviceAccountKey.json   # ⚠️ KEEP PRIVATE - Add to .gitignore
└── FIREBASE_SETUP.md        # This file
```

## Troubleshooting

### "Admin user not found in database"
- Make sure you ran `node scripts/create-admin.js`
- Check that the Firestore document exists in the `admins` collection

### "Cannot find module 'firebase-admin'"
- Run `npm install firebase-admin`

### "serviceAccountKey.json not found"
- Download it from Firebase Console (see Step 2)
- Place it in the root directory

### Login fails with "auth/user-not-found"
- The Firebase Auth user doesn't exist
- Run the create-admin script again

### Firestore permission denied
- Check your security rules in Firebase Console
- Make sure the admin document exists in Firestore

## Security Best Practices

1. ✅ Never commit `serviceAccountKey.json` to version control
2. ✅ Use environment variables for sensitive data
3. ✅ Change the default admin password after first login
4. ✅ Enable 2FA for admin accounts
5. ✅ Regularly audit admin access logs
6. ✅ Use strong, unique passwords
7. ✅ Implement rate limiting on login attempts

## Next Steps

1. Implement 2FA (Two-Factor Authentication)
2. Create admin dashboard
3. Add activity logging
4. Implement role-based access control (RBAC)
5. Add password reset functionality
6. Set up email notifications

## Support
For Firebase documentation, visit: https://firebase.google.com/docs
