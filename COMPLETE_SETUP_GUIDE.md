# 📋 Complete Setup Guide - MomPulse Super Admin Panel

## Overview

This guide walks you through the complete setup process to get your MomPulse Super Admin Panel working with Firebase.

---

## ✅ Step 1: Update Firestore Security Rules

### Why?
Your Firestore security rules are blocking access to the `admins` collection.

### How?

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mompulse-5ceb8**
3. Go to **Firestore Database** (left sidebar)
4. Click **Rules** tab
5. Delete all existing rules
6. Paste these rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{userId} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

7. Click **Publish** button
8. ⏳ Wait 30 seconds for rules to propagate

✅ **Done!** Rules are now updated.

---

## ✅ Step 2: Create Firebase Authentication User

### Why?
You need a user account to login to the admin panel.

### How?

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Users** tab
3. Click **Create user** button (top right)
4. Enter:
   - **Email**: `admin@mompulse.com`
   - **Password**: `admin_mompulse`
5. Click **Create user**

✅ **Done!** User is created in Firebase Auth.

---

## ✅ Step 3: Get the User UID

### Why?
You need the UID to create the Firestore document.

### How?

1. In Firebase Console → **Authentication** → **Users**
2. Find and click on `admin@mompulse.com`
3. Look for **User UID** field (at the top)
4. **Copy the entire UID** (looks like: `abc123def456xyz789...`)
5. Save it somewhere - you'll use it in the next step

✅ **Done!** You have the UID.

---

## ✅ Step 4: Create Firestore Document

### Why?
The admin document stores admin-specific data like role and permissions.

### How?

1. In Firebase Console, go to **Firestore Database**
2. Click **Create collection** button
3. Enter collection name: `admins`
4. Click **Next**
5. For Document ID, paste the **UID** you copied in Step 3
6. Click **Save**

Now add the admin data:

1. Click **Add field** button
2. Add these fields one by one:

| Field Name | Type | Value |
|-----------|------|-------|
| `email` | String | `admin@mompulse.com` |
| `role` | String | `super_admin` |
| `displayName` | String | `Super Admin` |
| `status` | String | `active` |
| `createdAt` | Timestamp | (current date/time) |

3. Click **Save** after each field

✅ **Done!** Firestore document is created.

---

## ✅ Step 5: Test the Login

### How?

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your browser: `http://localhost:3000`

3. **Hard refresh** the page (Ctrl+F5 or Cmd+Shift+R)

4. Login with:
   - **Email**: `admin@mompulse.com`
   - **Password**: `admin_mompulse`

5. You should be redirected to the dashboard! 🎉

---

## 🎯 Complete Checklist

- [ ] Step 1: Update Firestore security rules
- [ ] Step 1: Click Publish on rules
- [ ] Step 1: Wait 30 seconds
- [ ] Step 2: Create Firebase Auth user
- [ ] Step 3: Copy the user UID
- [ ] Step 4: Create Firestore document
- [ ] Step 4: Add all required fields
- [ ] Step 5: Hard refresh browser
- [ ] Step 5: Test login

---

## 🆘 Troubleshooting

### "Missing or insufficient permissions" error
- Make sure you completed Step 1 (Firestore rules)
- Make sure you clicked **Publish**
- Wait 30 seconds and refresh browser

### "User not found" error
- Make sure you completed Step 2 (Create Auth user)
- Make sure email is exactly: `admin@mompulse.com`

### "Admin user not found in database" error
- Make sure you completed Step 4 (Create Firestore document)
- Make sure the document ID matches the UID exactly
- Make sure you added all required fields

### Still not working?
1. Check browser console (F12) for detailed error messages
2. Try hard refresh (Ctrl+F5)
3. Check Firebase Console for any errors
4. Make sure all steps are completed

---

## 📁 Project Structure

```
mompulse-super-admin-panel/
├── app/
│   ├── page.tsx              # Login page
│   ├── dashboard/page.tsx    # Dashboard (after login)
│   └── layout.tsx
├── components/
│   ├── LoginForm.tsx         # Login form
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Icons.tsx
├── lib/
│   ├── firebase.ts           # Firebase config
│   └── auth.ts               # Auth service
├── .env.local                # Firebase config
└── Documentation files
```

---

## 🔐 Login Credentials

- **Email**: `admin@mompulse.com`
- **Password**: `admin_mompulse`

⚠️ **Change password after first login!**

---

## 📚 Additional Guides

- [FIX_SUMMARY.md](./FIX_SUMMARY.md) - Quick fix summary
- [FIRESTORE_RULES_FIX.md](./FIRESTORE_RULES_FIX.md) - Detailed Firestore rules guide
- [CREATE_ADMIN_USER.md](./CREATE_ADMIN_USER.md) - Manual admin user creation
- [START_HERE.md](./START_HERE.md) - Quick start guide

---

## ✨ Features

✅ Firebase Authentication  
✅ Firestore Integration  
✅ Responsive Design  
✅ Error Handling  
✅ Loading States  
✅ Protected Routes  
✅ TypeScript Support  
✅ Tailwind CSS Styling  

---

## 🚀 You're Ready!

Follow the 5 steps above and you'll have a fully functional admin login panel! 🎉

**Questions?** Check the troubleshooting section or review the additional guides.

---

**Happy coding!** 💻
