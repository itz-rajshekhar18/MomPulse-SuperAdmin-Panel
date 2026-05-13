import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

export interface AnalyticsData {
  revenueGrowth: Array<{ month: string; consultations: number; products: number; subscriptions: number }>;
  streamBreakdown: { label: string; value: number; percentage: number }[];
  userRetention: Array<{ week: number; frequency: number; value: number }>;
  userEngagement: { retention: number; churn: number };
  doctorMetrics: {
    avgResponse: number;
    patientRating: number;
    resolutionRate: number;
    activeDocs: number;
  };
  doctorPerformance: Array<{
    name: string;
    email: string;
    specialization: string;
    responseTime: string;
    rating: number;
    sessions: number;
  }>;
  netRevenue: number;
  revenueChange: number;
}

// Mock data generator - replace with real Firestore queries
function generateMockAnalytics(timeRange: '7days' | '30days' | '90days'): AnalyticsData {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const revenueGrowth = months.slice(0, timeRange === '7days' ? 1 : timeRange === '30days' ? 6 : 12).map((month, idx) => ({
    month,
    consultations: Math.floor(Math.random() * 50000) + 20000,
    products: Math.floor(Math.random() * 30000) + 10000,
    subscriptions: Math.floor(Math.random() * 40000) + 15000,
  }));

  const streamBreakdown = [
    { label: 'Consultations', value: 52, percentage: 52 },
    { label: 'Products', value: 28, percentage: 28 },
    { label: 'Subscriptions', value: 20, percentage: 20 },
  ];

  const userRetention = Array.from({ length: 84 }, (_, i) => ({
    week: i + 1,
    frequency: Math.floor(Math.random() * 100),
    value: Math.floor(Math.random() * 100),
  }));

  const doctorPerformance = [
    {
      name: 'Dr. Anis Thorne',
      email: 'anis.thorne@mompulse.com',
      specialization: 'Obstetrics',
      responseTime: '08:12m',
      rating: 4.92,
      sessions: 156,
    },
    {
      name: 'Dr. Elena Vance',
      email: 'elena.vance@mompulse.com',
      specialization: 'Pediatrics',
      responseTime: '06:43m',
      rating: 4.87,
      sessions: 142,
    },
  ];

  return {
    revenueGrowth,
    streamBreakdown,
    userRetention,
    userEngagement: { retention: 84.2, churn: 15.8 },
    doctorMetrics: {
      avgResponse: 14,
      patientRating: 4.92,
      resolutionRate: 98,
      activeDocs: 2.4,
    },
    doctorPerformance,
    netRevenue: 142850,
    revenueChange: 12.4,
  };
}

export async function getAnalyticsData(timeRange: '7days' | '30days' | '90days'): Promise<AnalyticsData> {
  try {
    // For now, return mock data
    // In production, fetch from Firestore collections:
    // - analytics/{timeRange}/revenue
    // - analytics/{timeRange}/engagement
    // - doctors/{doctorId}/metrics
    // - sessions/{sessionId}/data
    
    const analyticsData = generateMockAnalytics(timeRange);
    return analyticsData;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Return mock data as fallback
    return generateMockAnalytics(timeRange);
  }
}

// Real Firestore queries (to be implemented)
export async function getRevenueData(timeRange: '7days' | '30days' | '90days') {
  try {
    const analyticsRef = collection(db, 'analytics');
    const q = query(analyticsRef, where('type', '==', 'revenue'), where('timeRange', '==', timeRange));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
}

export async function getDoctorMetrics() {
  try {
    const doctorsRef = collection(db, 'doctors');
    const snapshot = await getDocs(doctorsRef);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching doctor metrics:', error);
    return [];
  }
}

export async function getEngagementMetrics(timeRange: '7days' | '30days' | '90days') {
  try {
    const analyticsRef = collection(db, 'analytics');
    const q = query(analyticsRef, where('type', '==', 'engagement'), where('timeRange', '==', timeRange));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return [];
  }
}

export async function getSessionMetrics(timeRange: '7days' | '30days' | '90days') {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('createdAt', '>=', getTimeRangeDate(timeRange)));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching session metrics:', error);
    return [];
  }
}

function getTimeRangeDate(timeRange: '7days' | '30days' | '90days'): Timestamp {
  const now = new Date();
  let daysAgo = 7;
  
  if (timeRange === '30days') daysAgo = 30;
  if (timeRange === '90days') daysAgo = 90;
  
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return Timestamp.fromDate(date);
}
