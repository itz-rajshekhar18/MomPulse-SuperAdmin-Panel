'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, AlertCircle, Loader, Video } from 'lucide-react';
import { getDoctorSessions, approveDoctorSession, rejectDoctorSession } from '@/lib/moderation';
import type { DoctorSession } from '@/lib/moderation';

export default function SessionRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [sessions, setSessions] = useState<DoctorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch sessions on mount and when filter changes
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const status = filterStatus === 'all' ? undefined : (filterStatus as 'pending_approval' | 'approved' | 'rejected');
        const data = await getDoctorSessions(status);
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [filterStatus]);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = sessions.filter((s) => s.approvalStatus === 'pending_approval').length;

  const handleApprove = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const success = await approveDoctorSession(sessionId);
      if (success) {
        setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, approvalStatus: 'approved' } : s)));
      }
    } catch (error) {
      console.error('Error approving session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const success = await rejectDoctorSession(sessionId);
      if (success) {
        setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, approvalStatus: 'rejected' } : s)));
      }
    } catch (error) {
      console.error('Error rejecting session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      approved: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Requests</h1>
          <p className="text-gray-600 mt-1">Manage and approve doctor-created sessions</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
          {pendingCount} Pending
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, doctor, specialty, or session type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending_approval', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No session requests found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-gray-900 text-lg">{session.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.duration}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {session.sessionType}
                    </span>
                  </div>
                </div>

                {/* Middle: Doctor Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold text-gray-900">{session.doctorName}</p>
                  <p className="text-xs text-purple-600 mt-1">{session.specialty}</p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-bold text-gray-900 text-lg">{session.price}</p>
                </div>

                {/* Status & Actions */}
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getStatusBadge(session.approvalStatus)}`}>
                    {getStatusLabel(session.approvalStatus)}
                  </span>
                  {session.approvalStatus === 'pending_approval' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(session.id)}
                        disabled={actionLoading === session.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === session.id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(session.id)}
                        disabled={actionLoading === session.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === session.id ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

  const handleApprove = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const success = await approveDoctorSession(sessionId);
      if (success) {
        setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, approvalStatus: 'approved' } : s)));
      }
    } catch (error) {
      console.error('Error approving session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const success = await rejectDoctorSession(sessionId);
      if (success) {
        setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, approvalStatus: 'rejected' } : s)));
      }
    } catch (error) {
      console.error('Error rejecting session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      approved: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Requests</h1>
          <p className="text-gray-600 mt-1">Manage and approve doctor-created sessions</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
          {pendingCount} Pending
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, doctor, specialty, or session type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending_approval', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No session requests found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-gray-900 text-lg">{session.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.duration}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {session.sessionType}
                    </span>
                  </div>
                </div>

                {/* Middle: Doctor Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold text-gray-900">{session.doctorName}</p>
                  <p className="text-xs text-purple-600 mt-1">{session.specialty}</p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-bold text-gray-900 text-lg">{session.price}</p>
                </div>

                {/* Status & Actions */}
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getStatusBadge(session.approvalStatus)}`}>
                    {getStatusLabel(session.approvalStatus)}
                  </span>
                  {session.approvalStatus === 'pending_approval' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(session.id)}
                        disabled={actionLoading === session.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === session.id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(session.id)}
                        disabled={actionLoading === session.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === session.id ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
