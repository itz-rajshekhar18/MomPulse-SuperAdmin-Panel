'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
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
            <div className="grid grid-cols-6 gap-4">
              <StatCard label="Total Users" value="12.4k" change="12%" changeType="up" />
              <StatCard label="Active Homeopaths" value="8.2k" change="8%" changeType="up" />
              <StatCard label="Doctors" value="450" change="5%" changeType="down" />
              <StatCard label="Sessions" value="2.1k" change="4%" changeType="up" />
              <StatCard label="Revenue" value="$45.2k" change="15%" changeType="up" />
              <StatCard label="Posts" value="15.8k" change="3%" changeType="up" />
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
