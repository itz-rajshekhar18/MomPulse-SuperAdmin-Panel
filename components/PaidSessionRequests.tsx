'use client';

import { CheckCircle } from 'lucide-react';

interface SessionRequest {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'completed' | 'pending';
}

export default function PaidSessionRequests() {
  const requests: SessionRequest[] = [
    {
      id: '1',
      name: 'Lactation Consult',
      type: 'Lactation Support',
      date: '15 days ago',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Postpartum Support',
      type: 'Postpartum Support',
      date: '12 days ago',
      status: 'completed',
    },
    {
      id: '3',
      name: 'Newborn Nutrition',
      type: 'Newborn Nutrition',
      date: '10 days ago',
      status: 'completed',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Paid Session Requests</h3>
          <p className="text-sm text-gray-600">Most requested consultations</p>
        </div>
        <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          View All Requests (34)
        </a>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{request.name}</p>
                <p className="text-xs text-gray-600">{request.date}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600">{request.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
