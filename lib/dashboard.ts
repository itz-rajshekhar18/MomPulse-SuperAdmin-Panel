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
    // Get counts from various collections
    const [
      usersSnapshot,
      doctorsSnapshot,
      sessionsSnapshot,
      postsSnapshot,
    ] = await Promise.all([
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(collection(db, 'doctors')),
      getCountFromServer(collection(db, 'doctorSessions')),
      getCountFromServer(collection(db, 'doctorContent')),
    ]);

    // Calculate real growth percentages
    const [
      userGrowth,
      doctorGrowth,
      sessionGrowth,
      postGrowth,
    ] = await Promise.all([
      calculateGrowthPercentage('users'),
      calculateGrowthPercentage('doctors'),
      calculateGrowthPercentage('doctorSessions'),
      calculateGrowthPercentage('doctorContent'),
    ]);
    
    return {
      totalUsers: usersSnapshot.data().count,
      doctors: doctorsSnapshot.data().count,
      sessions: sessionsSnapshot.data().count,
      posts: postsSnapshot.data().count,
      userGrowth,
      doctorGrowth,
      sessionGrowth,
      postGrowth,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return zero data on error
    return {
      totalUsers: 0,
      doctors: 0,
      sessions: 0,
      posts: 0,
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
    // Get user registration data for the last 6 months
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const currentDate = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      try {
        // Query users created in this month
        const q = query(
          collection(db, 'users'),
          where('createdAt', '>=', Timestamp.fromDate(monthStart)),
          where('createdAt', '<=', Timestamp.fromDate(monthEnd))
        );
        const snapshot = await getDocs(q);
        
        data.push({
          month: months[5 - i],
          value: snapshot.size
        });
      } catch (error) {
        console.error(`Error fetching data for month ${months[5 - i]}:`, error);
        // Fallback to 0 if query fails
        data.push({
          month: months[5 - i],
          value: 0
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    // Return fallback data if everything fails
    return [
      { month: 'JAN', value: 0 },
      { month: 'FEB', value: 0 },
      { month: 'MAR', value: 0 },
      { month: 'APR', value: 0 },
      { month: 'MAY', value: 0 },
      { month: 'JUN', value: 0 },
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
      
      return {
        id: doc.id,
        name: data.sessionType || data.title || 'Session Request',
        type: data.sessionType || data.category || 'General Consultation',
        date: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        status: data.status === 'completed' || data.status === 'finished' ? 'completed' : 'pending',
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