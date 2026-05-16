'use client';

import { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { getPendingDoctorVerifications } from '@/lib/dashboard';
import { approveDoctorRequest, rejectDoctorRequest } from '@/lib/moderation';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  credentials: string;
  status: 'approved' | 'rejected' | 'pending';
}

export default function DoctorVerificationPool() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getPendingDoctorVerifications();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctor verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: string) => {
    try {
      setActionLoading(doctorId);
      await approveDoctorRequest(doctorId);
      // Refresh the list after approval
      await fetchDoctors();
    } catch (error) {
      console.error('Error approving doctor:', error);
      alert('Failed to approve doctor. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId: string) => {
    try {
      setActionLoading(doctorId);
      await rejectDoctorRequest(doctorId);
      // Refresh the list after rejection
      await fetchDoctors();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      alert('Failed to reject doctor. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportReport = () => {
    // Generate CSV data
    const csvData = [
      ['Medical Expert', 'Specialization', 'Experience', 'Credentials', 'Status'],
      ...doctors.map(doc => [
        doc.name,
        doc.specialty,
        doc.experience,
        doc.credentials,
        doc.status
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctor-verifications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Doctor Verification Pool</h3>
          <p className="text-sm text-gray-600">Credentials verification awaiting review</p>
        </div>
        <button 
          onClick={handleExportReport}
          disabled={doctors.length === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Report
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Medical Expert
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Specialization
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Experience
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Credentials
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-200 animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : doctors.length > 0 ? (
              doctors.map((doctor) => (
                <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {doctor.specialty}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{doctor.experience}</td>
                  <td className="py-4 px-4">
                    {doctor.credentials ? (
                      <a 
                        href={doctor.credentials} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Credentials
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No file</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(doctor.id)}
                        disabled={actionLoading === doctor.id || doctor.status === 'approved'}
                        className={`px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          doctor.status === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        {actionLoading === doctor.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(doctor.id)}
                        disabled={actionLoading === doctor.id || doctor.status === 'rejected'}
                        className={`px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          doctor.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        {actionLoading === doctor.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Empty state
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No pending verifications</p>
                    <p className="text-xs text-gray-400 mt-1">All doctor credentials have been reviewed</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
