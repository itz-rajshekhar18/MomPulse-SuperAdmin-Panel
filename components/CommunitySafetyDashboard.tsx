'use client';

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Report {
  id: string;
  content: string;
  reason: string;
  author: string;
  urgency: 'high' | 'medium' | 'low';
  moderation: 'approved' | 'rejected' | 'pending';
}

export default function CommunitySafetyDashboard() {
  const reports: Report[] = [
    {
      id: '1',
      content: '"I think medical professionals are...',
      reason: 'MISINFORMATION',
      author: '@user_4452',
      urgency: 'high',
      moderation: 'pending',
    },
    {
      id: '2',
      content: '"I tried crypto advice for my...',
      reason: 'SPAM',
      author: '@crypto_mom_3',
      urgency: 'medium',
      moderation: 'pending',
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getModerationIcon = (moderation: string) => {
    switch (moderation) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Community Safety Dashboard</h3>
          <p className="text-sm text-gray-600">High-priority reported content requiring moderation</p>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900">
          Show more details →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Reported Content
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Report Reason
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Author
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Urgency
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Moderation
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4 text-sm text-gray-900">{report.content}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{report.reason}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{report.author}</td>
                <td className="py-4 px-4">
                  <span className={`text-sm font-medium uppercase ${getUrgencyColor(report.urgency)}`}>
                    {report.urgency}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {getModerationIcon(report.moderation)}
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {report.moderation}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
