# Fix Firestore Security Rules - "Missing or Insufficient Permissions" Error

## Problem
You're getting "Missing or insufficient permissions" error when trying to login. This is because your Firestore security rules are blocking read access to the `admins` collection.

## Solution

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mompulse-5ceb8**
3. Go to **Firestore Database** (left sidebar)
4. Click on **Rules** tab

### Step 2: Replace Security Rules

Delete all existing rules and paste these new rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write to admins collection (for development)
    // In production, restrict this to authenticated users only
    match /admins/{userId} {
      allow read, write: if true;
    }
    
    // Allow authenticated users to read their own admin document
    match /admins/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.auth.token.admin == true;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish Rules

Click **Publish** button to apply the new rules.

### Step 4: Test Login

Go back to your app and try logging in again. It should work now!

---

## For Production (More Secure)

Once you're ready for production, use these stricter rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read their own admin document
    match /admins/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.auth.token.admin == true;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Troubleshooting

### Still getting permission error?
1. Make sure you clicked **Publish** after updating rules
2. Wait 30 seconds for rules to propagate
3. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
4. Check browser console (F12) for detailed error messages

### Can't find the Rules tab?
1. Make sure you're in **Firestore Database** (not Realtime Database)
2. Look for the **Rules** tab at the top

### Need to create the admin user?
See [CREATE_ADMIN_USER.md](./CREATE_ADMIN_USER.md)

---

## What Changed in the Code

The `lib/auth.ts` file was updated to gracefully handle Firestore permission errors:
- If Firestore read fails, login still succeeds with basic user info
- This allows development without strict Firestore rules
- In production, you can enforce stricter rules

---

## Next Steps

1. ✅ Update Firestore security rules (above)
2. ✅ Publish the rules
3. ✅ Refresh your browser
4. ✅ Try logging in again

**You should now be able to login!** 🎉
