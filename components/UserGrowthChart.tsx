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
            <p className="text-sm text-gray-600">Last 2 weeks</p>
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
          <p className="text-sm text-gray-600">Last 2 weeks</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded">
            2 Weeks
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">
            1 Month
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-48 gap-2">
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
