# Testing & Deployment Guide

## Prerequisites
- Firebase project set up and configured
- Firestore database created
- Admin credentials configured in `.env.local`
- Build successful (verified ✅)

## Step 1: Deploy Firestore Rules

The Firestore rules have already been updated in `firestore.rules` with the three new collections:
- `doctorRequests`
- `sessionRequests`
- `articleRequests`

Deploy them to Firebase:

```bash
firebase deploy --only firestore:rules
```

## Step 2: Add Test Data to Firestore

### Add Test Doctor Request

Go to Firebase Console → Firestore → Create Collection `doctorRequests`

Add a document with ID `doctor_001`:
```json
{
  "name": "Dr. Marcus Thorne",
  "specialty": "Obstetrics & Gynecology",
  "experience": "12 Years",
  "credentials": "CREDENTIALS ATTACHED",
  "status": "pending",
  "location": "Austin, Texas",
  "languages": ["English", "Spanish"],
  "services": [
    {
      "name": "Prenatal Consultation",
      "price": "$120 / 30m"
    },
    {
      "name": "Postpartum Support",
      "price": "$95 / 30m"
    }
  ],
  "bio": "Dedicated to providing compassionate, evidence-based care...",
  "email": "marcus@example.com",
  "createdAt": "2024-05-12T10:00:00Z",
  "updatedAt": "2024-05-12T10:00:00Z"
}
```

### Add Test Session Request

Create collection `sessionRequests` and add document with ID `session_001`:
```json
{
  "patientName": "Amara Okafor",
  "patientDate": "May 12",
  "patientTime": "10:30 AM",
  "specialist": "Dr. Lisa Wong",
  "serviceType": "Lactation Support",
  "fee": "$120.00",
  "status": "pending",
  "priority": "standard",
  "userId": "user_123",
  "createdAt": "2024-05-12T10:00:00Z",
  "updatedAt": "2024-05-12T10:00:00Z"
}
```

### Add Test Article Request

Create collection `articleRequests` and add document with ID `article_001`:
```json
{
  "title": "First Trimester: Essential Vitamins for Expectant Mothers",
  "author": "Dr. Sarah Chen",
  "category": "NUTRITION",
  "status": "pending",
  "submittedDate": "2024-05-10T10:00:00Z",
  "views": 0,
  "flags": 0,
  "content": "This article discusses essential vitamins...",
  "authorId": "author_123",
  "createdAt": "2024-05-10T10:00:00Z",
  "updatedAt": "2024-05-10T10:00:00Z"
}
```

## Step 3: Test the Application

### Start Development Server
```bash
npm run dev
```

### Test Doctors Page
1. Navigate to `http://localhost:3000/dashboard/doctors`
2. You should see the test doctor request loaded
3. Click "Approve" button
4. Verify the status changes to "approved" in the UI
5. Check Firestore Console - status should be updated to "approved"
6. Click "Reject" button
7. Verify the status changes to "rejected"

### Test Sessions Page
1. Navigate to `http://localhost:3000/dashboard/session-requests`
2. You should see the test session request loaded
3. Click the approve button (checkmark icon)
4. Verify the status changes to "approved"
5. Check Firestore Console - status should be updated
6. Click the reject button (X icon)
7. Verify the status changes to "rejected"

### Test Articles Page
1. Navigate to `http://localhost:3000/dashboard/articles`
2. You should see the test article request loaded
3. Click "Publish" button
4. Verify the status changes to "published"
5. Check Firestore Console - status should be updated
6. Click "Reject" button
7. Verify the status changes to "rejected"

### Test Search & Filter
1. On any page, type in the search box
2. Verify results filter in real-time
3. Click status filter buttons (All, Pending, Approved, etc.)
4. Verify only matching items are shown

### Test Loading States
1. Add multiple documents to Firestore
2. Navigate to a page
3. Verify loading spinner appears briefly
4. Verify data loads correctly

## Step 4: Verify Firestore Operations

### Check Firestore Console
1. Go to Firebase Console → Firestore
2. Open `doctorRequests` collection
3. Click on a document
4. Verify `updatedAt` timestamp changes when you approve/reject
5. Verify `status` field updates correctly

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform approve/reject actions
4. Verify no errors appear
5. Check for success/error logs

## Step 5: Production Deployment

### Build for Production
```bash
npm run build
```

Verify build completes successfully with no errors.

### Deploy to Hosting
```bash
firebase deploy
```

This will deploy:
- Next.js application to Firebase Hosting
- Firestore rules to Firestore

### Verify Production
1. Visit your production URL
2. Login with admin credentials
3. Test all three moderation pages
4. Verify approve/reject functionality works
5. Check Firestore operations in production

## Troubleshooting

### Issue: "Missing or insufficient permissions" error
**Solution**: 
- Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Check that admin user email matches the rule: `admin@mompulse.com`
- Verify user is authenticated before accessing pages

### Issue: Data not loading
**Solution**:
- Check browser console for errors
- Verify Firestore collections exist and have documents
- Check that documents have all required fields
- Verify Firestore rules allow read access

### Issue: Approve/Reject buttons not working
**Solution**:
- Check browser console for errors
- Verify Firestore rules allow write access
- Check that `updatedAt` field is being set correctly
- Verify network requests in DevTools Network tab

### Issue: Timestamps showing incorrectly
**Solution**:
- Firestore Timestamps are automatically converted
- Check that `submittedDate` field is a Firestore Timestamp
- Verify date formatting in component

## Performance Optimization

### Current Implementation
- Fetches all documents on page load
- Filters on client-side
- Updates UI immediately after action

### Future Improvements
1. **Pagination**: Add pagination for large datasets
2. **Real-time Updates**: Use Firestore listeners for live updates
3. **Caching**: Implement client-side caching
4. **Batch Operations**: Batch multiple approvals/rejections
5. **Search Optimization**: Use Firestore full-text search

## Monitoring

### Firestore Usage
Monitor in Firebase Console:
- Read operations
- Write operations
- Storage usage
- Bandwidth usage

### Application Performance
Monitor in browser:
- Page load time
- Component render time
- Network requests
- Memory usage

## Security Checklist

- ✅ Firestore rules restrict access to admins
- ✅ User authentication required
- ✅ Email verification for admin access
- ✅ Timestamps tracked for audit trail
- ✅ Error messages don't expose sensitive data
- ✅ No sensitive data in console logs

## Support

For issues or questions:
1. Check browser console for errors
2. Check Firestore Console for data
3. Review Firestore rules in `firestore.rules`
4. Check `.env.local` for correct Firebase config
5. Verify admin user exists in Firebase Auth
