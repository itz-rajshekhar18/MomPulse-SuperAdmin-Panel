# Create Admin User Manually in Firebase

Since you can't use the admin SDK script due to organization policies, follow these steps to create the admin user manually.

## Step 1: Create Firebase Authentication User

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mompulse-5ceb8**
3. Go to **Authentication** (left sidebar)
4. Click **Users** tab
5. Click **Create user** button (top right)
6. Enter:
   - **Email**: `admin@mompulse.com`
   - **Password**: `admin_mompulse`
7. Click **Create user**

✅ **Done!** The user is now created in Firebase Auth.

---

## Step 2: Get the User ID (UID)

1. In the **Users** list, find the user you just created: `admin@mompulse.com`
2. Click on it to open the user details
3. Copy the **User UID** (it looks like: `abc123def456...`)
4. Save this UID - you'll need it in the next step

---

## Step 3: Create Firestore Document

1. Go to **Firestore Database** (left sidebar)
2. Click **Create collection** button
3. Enter collection name: `admins`
4. Click **Next**
5. Click **Auto ID** to generate a document ID
6. In the **Document ID** field, paste the **UID** you copied in Step 2
7. Click **Save**

Now add the admin data:

1. Click **Add field** button
2. Add these fields:

| Field Name | Type | Value |
|-----------|------|-------|
| `email` | String | `admin@mompulse.com` |
| `role` | String | `super_admin` |
| `displayName` | String | `Super Admin` |
| `status` | String | `active` |
| `createdAt` | Timestamp | (current date/time) |

3. Click **Save**

---

## Step 4: Test Login

1. Go to your app: `http://localhost:3000`
2. Login with:
   - **Email**: `admin@mompulse.com`
   - **Password**: `admin_mompulse`
3. You should be redirected to the dashboard! 🎉

---

## Complete Firestore Document Example

Your `admins` collection should look like this:

```
Collection: admins
  Document ID: [user-uid-from-step-2]
    Fields:
      - email: "admin@mompulse.com"
      - role: "super_admin"
      - displayName: "Super Admin"
      - status: "active"
      - createdAt: [current timestamp]
      - permissions: [array]
        - "manage_users"
        - "manage_admins"
        - "view_analytics"
        - "manage_settings"
        - "manage_content"
```

---

## Troubleshooting

### "User already exists"
- The user is already created in Firebase Auth
- Just proceed to Step 2 to get the UID

### "Collection not found"
- Make sure you created the `admins` collection
- Check that the document ID matches the user UID exactly

### Still can't login?
1. Make sure Firestore security rules are updated (see [FIRESTORE_RULES_FIX.md](./FIRESTORE_RULES_FIX.md))
2. Refresh your browser (Ctrl+F5)
3. Check browser console (F12) for error messages

### Can't find the user UID?
1. Go to Firebase Console → Authentication → Users
2. Click on the `admin@mompulse.com` user
3. Look for "User UID" field at the top
4. Copy the entire UID string

---

## Next Steps

1. ✅ Create Firebase Auth user
2. ✅ Get the user UID
3. ✅ Create Firestore document
4. ✅ Update Firestore security rules (see [FIRESTORE_RULES_FIX.md](./FIRESTORE_RULES_FIX.md))
5. ✅ Test login

**You're all set!** 🎉
