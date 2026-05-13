# Fix Firestore Rules for Admin Access

Your current Firestore rules don't have an `admins` collection rule. Add this to your rules:

## Add This to Your Firestore Rules

Find this line in your rules:
```firestore
// Top-level Doctors collection (for consultation page)
match /doctors/{doctorId} {
```

**ADD THIS BEFORE IT:**

```firestore
// ========================================
// ADMIN PANEL COLLECTIONS
// ========================================

// Admins collection - for super admin panel
match /admins/{adminId} {
  // Admins can read their own data
  allow read: if isAuthenticated() && request.auth.uid == adminId;
  
  // Admins can update their own data
  allow update: if isAuthenticated() && request.auth.uid == adminId;
  
  // Only super admins can create/delete admin users
  allow create, delete: if isAdmin();
}
```

## Complete Updated Rules

Here's the complete section to add at the beginning of your rules (after the helper functions):

```firestore
// ========================================
// ADMIN PANEL COLLECTIONS
// ========================================

// Admins collection - for super admin panel
match /admins/{adminId} {
  // Admins can read their own data
  allow read: if isAuthenticated() && request.auth.uid == adminId;
  
  // Admins can update their own data
  allow update: if isAuthenticated() && request.auth.uid == adminId;
  
  // Only super admins can create/delete admin users
  allow create, delete: if isAdmin();
}
```

## Steps to Update

1. Go to Firebase Console → Firestore Database → Rules
2. Find the line: `// Top-level Doctors collection (for consultation page)`
3. Add the admin rules BEFORE that line
4. Click **Publish**
5. Wait 30 seconds
6. Refresh your browser and try login again

## Expected Result

After updating the rules, you should be able to:
- ✅ Login successfully
- ✅ Redirect to dashboard
- ✅ See admin data from Firestore
- ✅ No permission errors
