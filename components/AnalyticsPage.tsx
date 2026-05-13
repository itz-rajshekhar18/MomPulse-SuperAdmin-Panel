'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Loader } from 'lucide-react';
import { getAnalyticsData } from '@/lib/analytics';

interface AnalyticsData {
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Performance</h1>
          <p className="text-gray-600 mt-1">Real-time health indicators for the MomPulse ecosystem</p>
        </div>
        <div className="flex gap-2">
          {(['7days', '30days', '90days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Net Revenue Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-600 text-sm font-semibold">NET REVENUE</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">${data.netRevenue.toLocaleString()}</h2>
            <p className="text-purple-600 text-sm mt-2">
              <span className="font-semibold">+{data.revenueChange.toFixed(1)}%</span> this month
            </p>
          </div>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* Revenue Growth Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
            <p className="text-sm text-gray-600">Cumulative revenue across all streams</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-xs text-gray-600">Consultations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-xs text-gray-600">Products</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-xs text-gray-600">Subscriptions</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="consultations" stroke="#9333ea" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="products" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="subscriptions" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stream Breakdown and Sentiment */}
      <div className="grid grid-cols-2 gap-6">
        {/* Stream Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Stream Breakdown</h3>
          <div className="space-y-4">
            {data.streamBreakdown.map((stream, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stream.label}</span>
                  <span className="text-sm font-bold text-gray-900">{stream.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      idx === 0 ? 'bg-purple-600' : idx === 1 ? 'bg-blue-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${stream.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Sentiment */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">AI Sentiment</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time analysis of user feedback</p>
              <p className="text-sm text-green-700 mt-4 font-semibold">GROWTH INSIGHT</p>
              <p className="text-xs text-gray-700 mt-2">
                Engagement metrics suggest 15% higher community activity. Consider promoting better content to drive higher thresholds in the onboarding flow.
              </p>
              <button className="text-green-700 text-xs font-semibold mt-4 hover:underline">APPLY SUGGESTION →</button>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* User Retention Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">User Retention Heatmap</h3>
        <div className="grid grid-cols-12 gap-1">
          {data.userRetention.map((item, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: `rgba(147, 51, 234, ${item.value / 100})`,
              }}
              title={`Week ${item.week}: ${item.frequency} users`}
            ></div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">Frequency Heatmap - Darker = Higher Retention</p>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Engagement Metrics</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Positive</span>
                <span className="text-sm font-bold text-gray-900">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-600" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Supportive</span>
                <span className="text-sm font-bold text-gray-900">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Concerns</span>
                <span className="text-sm font-bold text-gray-900">7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-red-600" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Doctor Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-semibold">Avg. Response</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.doctorMetrics.avgResponse}m</p>
              <p className="text-xs text-gray-500 mt-1">Minutes per consultation</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-semibold">Patient Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.doctorMetrics.patientRating.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Out of 5.0 stars</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-semibold">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.doctorMetrics.resolutionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Issues resolved first contact</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-semibold">Active Docs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.doctorMetrics.activeDocs.toLocaleString()}k</p>
              <p className="text-xs text-gray-500 mt-1">Currently online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Doctor Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">PHYSICIAN</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">SPECIALIZATION</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">RESPONSE TIME</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">RATING</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">SESSIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.doctorPerformance.map((doctor, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-xs text-gray-500">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">{doctor.specialization}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">{doctor.responseTime}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">{doctor.rating.toFixed(2)} ⭐</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">{doctor.sessions}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
