'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { getRecentSessionRequests, getTotalSessionRequestsCount } from '@/lib/dashboard';

interface SessionRequest {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'completed' | 'pending';
}

export default function PaidSessionRequests() {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionRequests, total] = await Promise.all([
          getRecentSessionRequests(),
          getTotalSessionRequestsCount(),
        ]);
        setRequests(sessionRequests);
        setTotalCount(total);
      } catch (error) {
        console.error('Error fetching session requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Paid Session Requests</h3>
          <p className="text-sm text-gray-600">Most requested consultations</p>
        </div>
        <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          View All Requests ({totalCount})
        </a>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  request.status === 'completed' 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  {request.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{request.name}</p>
                  <p className="text-xs text-gray-600">{request.date}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">{request.type}</span>
            </div>
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No session requests found</p>
            <p className="text-xs text-gray-400 mt-1">Session requests will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
}
