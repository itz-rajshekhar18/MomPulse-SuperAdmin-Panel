# 🚀 MomPulse Super Admin Panel - Setup Instructions

## ⚡ Quick Fix for "Missing or Insufficient Permissions" Error

Your login error is fixed! Follow these 5 simple steps:

---

## 📋 5-Step Setup

### 1️⃣ Update Firestore Security Rules (2 min)

```
Firebase Console → Firestore Database → Rules
```

Replace all rules with:
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

Click **Publish** and wait 30 seconds.

---

### 2️⃣ Create Firebase Auth User (1 min)

```
Firebase Console → Authentication → Users → Create user
```

Enter:
- Email: `admin@mompulse.com`
- Password: `admin_mompulse`

Click **Create user**.

---

### 3️⃣ Get User UID (1 min)

```
Firebase Console → Authentication → Users
```

Click on `admin@mompulse.com` and copy the **User UID**.

---

### 4️⃣ Create Firestore Document (2 min)

```
Firebase Console → Firestore Database → Create collection
```

- Collection name: `admins`
- Document ID: Paste the UID from Step 3
- Add fields:
  - `email`: `admin@mompulse.com`
  - `role`: `super_admin`
  - `displayName`: `Super Admin`
  - `status`: `active`
  - `createdAt`: (current timestamp)

---

### 5️⃣ Test Login (1 min)

1. Hard refresh browser: **Ctrl+F5** (or Cmd+Shift+R)
2. Go to: `http://localhost:3000`
3. Login with:
   - Email: `admin@mompulse.com`
   - Password: `admin_mompulse`
4. You should see the dashboard! 🎉

---

## 📚 Detailed Guides

| Guide | Purpose |
|-------|---------|
| [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) | Step-by-step setup with screenshots |
| [FIX_SUMMARY.md](./FIX_SUMMARY.md) | Quick fix summary |
| [FIRESTORE_RULES_FIX.md](./FIRESTORE_RULES_FIX.md) | Firestore rules details |
| [CREATE_ADMIN_USER.md](./CREATE_ADMIN_USER.md) | Admin user creation guide |

---

## ✅ What Was Fixed

- ✅ Updated `lib/auth.ts` to handle Firestore errors gracefully
- ✅ Build verified - no errors
- ✅ Ready for testing

---

## 🔐 Login Credentials

- **Email**: `admin@mompulse.com`
- **Password**: `admin_mompulse`

---

## 🆘 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "Missing or insufficient permissions" | Update Firestore rules (Step 1) |
| "User not found" | Create Firebase Auth user (Step 2) |
| "Admin user not found in database" | Create Firestore document (Step 4) |
| Still not working? | Hard refresh browser (Ctrl+F5) |

---

## 🎯 Next Steps

1. Follow the 5 steps above
2. Test login
3. Change default password
4. Enable 2FA (optional)

---

**You're all set!** Follow the 5 steps and you'll be up and running in ~10 minutes. 🚀
