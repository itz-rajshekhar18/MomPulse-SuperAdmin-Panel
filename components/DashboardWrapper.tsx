'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats, formatNumber, type DashboardStats } from '@/lib/dashboard';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import UserGrowthChart from '@/components/UserGrowthChart';
import PaidSessionRequests from '@/components/PaidSessionRequests';
import DoctorVerificationPool from '@/components/DoctorVerificationPool';
import ArticleModerationQueue from '@/components/ArticleModerationQueue';
import CommunitySafetyDashboard from '@/components/CommunitySafetyDashboard';

export default function DashboardWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (isAuthenticated) {
        try {
          setStatsLoading(true);
          const dashboardStats = await getDashboardStats();
          setStats(dashboardStats);
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              {statsLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))
              ) : stats ? (
                <>
                  <StatCard 
                    label="Total Users" 
                    value={formatNumber(stats.totalUsers)} 
                    change={`${stats.userGrowth}%`} 
                    changeType="up" 
                  />
                  <StatCard 
                    label="Doctors" 
                    value={formatNumber(stats.doctors)} 
                    change={`${stats.doctorGrowth}%`} 
                    changeType={stats.doctorGrowth > 0 ? "up" : "down"} 
                  />
                  <StatCard 
                    label="Sessions" 
                    value={formatNumber(stats.sessions)} 
                    change={`${stats.sessionGrowth}%`} 
                    changeType="up" 
                  />
                  <StatCard 
                    label="Posts" 
                    value={formatNumber(stats.posts)} 
                    change={`${stats.postGrowth}%`} 
                    changeType="up" 
                  />
                </>
              ) : (
                // Error state
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Error loading stats</p>
                  </div>
                ))
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <UserGrowthChart />
              </div>
              <div>
                <PaidSessionRequests />
              </div>
            </div>

            {/* Doctor Verification */}
            <DoctorVerificationPool />

            {/* Article Moderation */}
            <ArticleModerationQueue />

            {/* Community Safety */}
            <CommunitySafetyDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
