import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  getCountFromServer,
} from 'firebase/firestore';

// Dashboard Stats Interface
export interface DashboardStats {
  totalUsers: number;
  doctors: number;
  sessions: number;
  posts: number;
  userGrowth: number;
  doctorGrowth: number;
  sessionGrowth: number;
  postGrowth: number;
}

// Helper function to calculate growth percentage
async function calculateGrowthPercentage(collectionName: string, dateField: string = 'createdAt'): Promise<number> {
  try {
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get current month count
    const currentMonthQuery = query(
      collection(db, collectionName),
      where(dateField, '>=', Timestamp.fromDate(currentMonthStart))
    );
    const currentMonthSnapshot = await getDocs(currentMonthQuery);
    const currentMonthCount = currentMonthSnapshot.size;

    // Get last month count
    const lastMonthQuery = query(
      collection(db, collectionName),
      where(dateField, '>=', Timestamp.fromDate(lastMonthStart)),
      where(dateField, '<=', Timestamp.fromDate(lastMonthEnd))
    );
    const lastMonthSnapshot = await getDocs(lastMonthQuery);
    const lastMonthCount = lastMonthSnapshot.size;

    // Calculate growth percentage
    if (lastMonthCount === 0) {
      return currentMonthCount > 0 ? 100 : 0;
    }
    
    return Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);
  } catch (error) {
    console.error(`Error calculating growth for ${collectionName}:`, error);
    return 0;
  }
}

// Get real dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Return fixed values as requested
    return {
      totalUsers: 147,
      doctors: 4,
      sessions: 1,
      posts: 2,
      // Calculate real growth percentages
      userGrowth: await calculateGrowthPercentage('users'),
      doctorGrowth: await calculateGrowthPercentage('doctors'),
      sessionGrowth: await calculateGrowthPercentage('doctorSessions'),
      postGrowth: await calculateGrowthPercentage('doctorContent'),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fixed values on error
    return {
      totalUsers: 147,
      doctors: 4,
      sessions: 1,
      posts: 2,
      userGrowth: 0,
      doctorGrowth: 0,
      sessionGrowth: 0,
      postGrowth: 0,
    };
  }
}

// Get user growth chart data
export async function getUserGrowthData() {
  try {
    // Return fixed growth data for the last 14 days
    const data = [
      { month: 'Day 1', value: 120 },
      { month: 'Day 2', value: 123 },
      { month: 'Day 3', value: 125 },
      { month: 'Day 4', value: 128 },
      { month: 'Day 5', value: 130 },
      { month: 'Day 6', value: 132 },
      { month: 'Day 7', value: 135 },
      { month: 'Day 8', value: 137 },
      { month: 'Day 9', value: 139 },
      { month: 'Day 10', value: 141 },
      { month: 'Day 11', value: 143 },
      { month: 'Day 12', value: 144 },
      { month: 'Day 13', value: 146 },
      { month: 'Day 14', value: 147 }, // Current total
    ];
    
    return data;
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    // Return fallback data if everything fails
    return [
      { month: 'Day 1', value: 120 },
      { month: 'Day 2', value: 123 },
      { month: 'Day 3', value: 125 },
      { month: 'Day 4', value: 128 },
      { month: 'Day 5', value: 130 },
      { month: 'Day 6', value: 132 },
      { month: 'Day 7', value: 135 },
      { month: 'Day 8', value: 137 },
      { month: 'Day 9', value: 139 },
      { month: 'Day 10', value: 141 },
      { month: 'Day 11', value: 143 },
      { month: 'Day 12', value: 144 },
      { month: 'Day 13', value: 146 },
      { month: 'Day 14', value: 147 },
    ];
  }
}

// Get recent session requests for dashboard widget
export async function getRecentSessionRequests() {
  try {
    const q = query(
      collection(db, 'doctorSessions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      const daysAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine status with proper typing
      const status: 'completed' | 'pending' = 
        data.status === 'completed' || data.status === 'finished' ? 'completed' : 'pending';
      
      return {
        id: doc.id,
        name: data.sessionType || data.title || 'Session Request',
        type: data.sessionType || data.category || 'General Consultation',
        date: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        status,
      };
    });
  } catch (error) {
    console.error('Error fetching recent session requests:', error);
    return [];
  }
}

// Get total count of session requests for "View All" link
export async function getTotalSessionRequestsCount(): Promise<number> {
  try {
    const snapshot = await getCountFromServer(collection(db, 'doctorSessions'));
    return snapshot.data().count;
  } catch (error) {
    console.error('Error fetching total session requests count:', error);
    return 0;
  }
}

// Get pending doctor verifications for dashboard widget
export async function getPendingDoctorVerifications() {
  try {
    const q = query(
      collection(db, 'doctorRequests'),
      where('status', '==', 'pending'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown Doctor',
        specialty: data.specialty || 'General',
        experience: data.experience || 'N/A',
        credentials: data.credentials || 'credentials.pdf',
        status: data.status,
      };
    });
  } catch (error) {
    console.error('Error fetching pending doctor verifications:', error);
    return [];
  }
}

// Get recent articles for moderation queue widget
export async function getRecentArticlesForModeration() {
  try {
    const q = query(
      collection(db, 'doctorContent'),
      where('approvalStatus', '==', 'pending_approval'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Map approvalStatus to status for the component
      let status: 'pending' | 'published' | 'rejected' = 'pending';
      if (data.approvalStatus === 'approved') {
        status = 'published';
      } else if (data.approvalStatus === 'rejected') {
        status = 'rejected';
      }
      
      return {
        id: doc.id,
        title: data.title || 'Untitled Article',
        category: data.category || 'GENERAL',
        image: data.imageUrl || data.thumbnailUrl || null, // Use actual image URL from document
        status,
      };
    });
  } catch (error) {
    console.error('Error fetching articles for moderation:', error);
    return [];
  }
}

// Get community safety reports
export async function getCommunityReports() {
  try {
    const q = query(
      collection(db, 'communityReports'),
      where('moderation', '==', 'pending'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content || 'Reported content...',
        reason: data.reason || 'INAPPROPRIATE',
        author: data.author || '@unknown_user',
        urgency: data.urgency || 'medium',
        moderation: data.moderation || 'pending',
      };
    });
  } catch (error) {
    console.error('Error fetching community reports:', error);
    return [];
  }
}

// Format numbers for display
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}