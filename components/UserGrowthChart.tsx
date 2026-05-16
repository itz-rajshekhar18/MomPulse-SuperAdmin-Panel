'use client';

import { useEffect, useState } from 'react';
import { getUserGrowthData } from '@/lib/dashboard';

interface GrowthData {
  month: string;
  value: number;
}

export default function UserGrowthChart() {
  const [data, setData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const growthData = await getUserGrowthData();
        setData(growthData);
      } catch (error) {
        console.error('Error fetching user growth data:', error);
        // Fallback data
        setData([
          { month: 'JAN', value: 40 },
          { month: 'FEB', value: 60 },
          { month: 'MAR', value: 50 },
          { month: 'APR', value: 70 },
          { month: 'MAY', value: 85 },
          { month: 'JUN', value: 95 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 100;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Growth Trends</h3>
            <p className="text-sm text-gray-600">Last 6 months</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Growth Trends</h3>
          <p className="text-sm text-gray-600">Last 6 months</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">
            6 Months
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">
            1 Year
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-48 gap-4">
        {data.map((item) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition hover:opacity-80"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-xs font-medium text-gray-600">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
