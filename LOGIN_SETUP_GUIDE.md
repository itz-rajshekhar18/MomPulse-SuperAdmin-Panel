# 🔐 Login Setup Guide

## Problem
After clicking login, you're not being redirected to the dashboard because the admin user doesn't exist in Firebase yet.

## Solution

### Step 1: Create Admin User

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to the setup page:
   ```
   http://localhost:3000/setup
   ```

3. You'll see a form with pre-filled credentials:
   - **Email**: `admin@mompulse.com`
   - **Password**: `admin_mompulse`

4. Click **"Create Admin User"** button

5. You should see a success message:
   ```
   ✅ Admin user created successfully!
   
   Email: admin@mompulse.com
   Password: admin_mompulse
   UID: [user-id]
   
   You can now login with these credentials.
   ```

### Step 2: Login to Dashboard

1. Go to the login page:
   ```
   http://localhost:3000
   ```

2. Enter credentials:
   - **Email**: `admin@mompulse.com`
   - **Password**: `admin_mompulse`

3. Click **"Enter Console"** button

4. You should be redirected to the dashboard:
   ```
   http://localhost:3000/dashboard
   ```

---

## What Happens Behind the Scenes

### Setup Page (`/setup`)
- Creates a Firebase Authentication user
- Creates a Firestore document in the `admins` collection
- Stores admin metadata (role, permissions, etc.)

### Login Page (`/`)
- Authenticates with Firebase Auth
- Tries to fetch admin data from Firestore
- Redirects to dashboard on success

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Shows admin statistics and data
- Displays navigation sidebar

---

## Troubleshooting

### "This email is already registered"
- The admin user already exists
- Go directly to login page and try logging in
- If you forgot the password, you'll need to reset it in Firebase Console

### "Password is too weak"
- Use a password with at least 6 characters
- Try: `admin_mompulse` (default)

### Still not redirecting to dashboard?
1. Check browser console (F12) for errors
2. Make sure you're logged in (check Firebase Console)
3. Try hard refresh (Ctrl+F5)
4. Check that Firestore security rules allow reads

### Can't access setup page?
- Make sure dev server is running: `npm run dev`
- Check URL: `http://localhost:3000/setup`
- Try hard refresh (Ctrl+F5)

---

## Security Note

⚠️ **Important**: The setup page is for development only. In production:
1. Remove or protect the `/setup` page
2. Use Firebase Console to create admin users
3. Implement proper admin user management
4. Use strong, unique passwords

---

## Quick Checklist

- [ ] Start dev server: `npm run dev`
- [ ] Go to setup page: `http://localhost:3000/setup`
- [ ] Click "Create Admin User"
- [ ] See success message
- [ ] Go to login page: `http://localhost:3000`
- [ ] Enter credentials
- [ ] Click "Enter Console"
- [ ] See dashboard at `/dashboard`

---

## Next Steps

1. ✅ Create admin user (setup page)
2. ✅ Login with credentials
3. ✅ Explore dashboard
4. ✅ Change password (recommended)
5. ✅ Enable 2FA (optional)

---

**You're all set!** Follow the steps above to create the admin user and login to the dashboard. 🚀
