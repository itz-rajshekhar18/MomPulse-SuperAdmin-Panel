'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Flag, Eye, Loader, Video, FileText } from 'lucide-react';
import { getDoctorContent, approveDoctorContent, rejectDoctorContent } from '@/lib/moderation';
import type { DoctorContent } from '@/lib/moderation';

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'video'>('all');
  const [content, setContent] = useState<DoctorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch content on mount and when filter changes
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const status = filterStatus === 'all' ? undefined : (filterStatus as 'pending_approval' | 'approved' | 'rejected');
        const contentType = filterType === 'all' ? undefined : (filterType as 'article' | 'video');
        const data = await getDoctorContent(status, contentType);
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filterStatus, filterType]);

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = content.filter((c) => c.approvalStatus === 'pending_approval').length;
  const articlesCount = content.filter((c) => c.contentType === 'article').length;
  const videosCount = content.filter((c) => c.contentType === 'video').length;

  const handleApprove = async (contentId: string) => {
    setActionLoading(contentId);
    try {
      const success = await approveDoctorContent(contentId);
      if (success) {
        setContent(content.map((c) => (c.id === contentId ? { ...c, approvalStatus: 'approved' } : c)));
      }
    } catch (error) {
      console.error('Error approving content:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contentId: string) => {
    setActionLoading(contentId);
    try {
      const success = await rejectDoctorContent(contentId);
      if (success) {
        setContent(content.map((c) => (c.id === contentId ? { ...c, approvalStatus: 'rejected' } : c)));
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      NUTRITION: 'bg-teal-100 text-teal-700 border border-teal-300',
      WELLNESS: 'bg-green-100 text-green-700 border border-green-300',
      EXERCISE: 'bg-purple-100 text-purple-700 border border-purple-300',
      RECOVERY: 'bg-pink-100 text-pink-700 border border-pink-300',
      PREGNANCY: 'bg-blue-100 text-blue-700 border border-blue-300',
      POSTPARTUM: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
    };
    return colors[category.toUpperCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      approved: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const getCategoryBgColor = (index: number) => {
    const colors = ['bg-teal-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles & Videos</h1>
          <p className="text-gray-600 mt-1">Manage and approve doctor-created content</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            {pendingCount} Pending
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg text-sm">
            {articlesCount} Articles
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg text-sm">
            {videosCount} Videos
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, doctor, category, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Status Filter */}
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
          {/* Type Filter */}
          <div className="w-px bg-gray-300"></div>
          {(['all', 'article', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
              }`}
            >
              {type === 'article' && <FileText className="w-4 h-4" />}
              {type === 'video' && <Video className="w-4 h-4" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No content found</p>
          </div>
        ) : (
          filteredContent.map((item, index) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden flex flex-col">
              {/* Image/Thumbnail */}
              <div className={`${getCategoryBgColor(index)} h-32 flex items-center justify-center relative`}>
                {item.contentType === 'video' ? (
                  <Video className="w-10 h-10 text-white opacity-50" />
                ) : (
                  <BookOpen className="w-10 h-10 text-white opacity-50" />
                )}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                  item.contentType === 'video' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {item.contentType === 'video' ? 'VIDEO' : 'ARTICLE'}
                </span>
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-600 mb-1">By <span className="font-semibold">{item.doctorName}</span></p>
                <p className="text-xs text-purple-600 mb-3">{item.specialty}</p>

                {/* Description */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-3 pb-3 border-b border-gray-200">
                  {item.description}
                </p>

                {/* Status */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.approvalStatus)}`}>
                    {getStatusLabel(item.approvalStatus)}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Created {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date((item.createdAt as any).seconds * 1000).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                {item.approvalStatus === 'pending_approval' && (
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {actionLoading === item.id ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {actionLoading === item.id ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '✗ Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'video'>('all');
  const [content, setContent] = useState<DoctorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch content on mount and when filter changes
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const status = filterStatus === 'all' ? undefined : (filterStatus as 'pending_approval' | 'approved' | 'rejected');
        const contentType = filterType === 'all' ? undefined : (filterType as 'article' | 'video');
        const data = await getDoctorContent(status, contentType);
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filterStatus, filterType]);

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = content.filter((c) => c.approvalStatus === 'pending_approval').length;
  const articlesCount = content.filter((c) => c.contentType === 'article').length;
  const videosCount = content.filter((c) => c.contentType === 'video').length;

  const handleApprove = async (contentId: string) => {
    setActionLoading(contentId);
    try {
      const success = await approveDoctorContent(contentId);
      if (success) {
        setContent(content.map((c) => (c.id === contentId ? { ...c, approvalStatus: 'approved' } : c)));
      }
    } catch (error) {
      console.error('Error approving content:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contentId: string) => {
    setActionLoading(contentId);
    try {
      const success = await rejectDoctorContent(contentId);
      if (success) {
        setContent(content.map((c) => (c.id === contentId ? { ...c, approvalStatus: 'rejected' } : c)));
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      NUTRITION: 'bg-teal-100 text-teal-700 border border-teal-300',
      WELLNESS: 'bg-green-100 text-green-700 border border-green-300',
      EXERCISE: 'bg-purple-100 text-purple-700 border border-purple-300',
      RECOVERY: 'bg-pink-100 text-pink-700 border border-pink-300',
      PREGNANCY: 'bg-blue-100 text-blue-700 border border-blue-300',
      POSTPARTUM: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
    };
    return colors[category.toUpperCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      approved: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const getCategoryBgColor = (index: number) => {
    const colors = ['bg-teal-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage and moderate community articles</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            {pendingCount} Pending
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            {flaggedCount} Flagged
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'published', 'rejected', 'flagged'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No articles found</p>
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden flex flex-col">
              {/* Image */}
              <div className={`${getCategoryBgColor(index)} h-32 flex items-center justify-center relative`}>
                <BookOpen className="w-10 h-10 text-white opacity-50" />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 text-sm">{article.title}</h3>
                <p className="text-xs text-gray-600 mb-3">By <span className="font-semibold">{article.author}</span></p>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()} views
                  </div>
                  {article.flags > 0 && (
                    <div className="flex items-center gap-1 text-orange-600 font-semibold">
                      <Flag className="w-4 h-4" />
                      {article.flags}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(article.status)}`}>
                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">Submitted {article.submittedDate instanceof Date ? article.submittedDate.toLocaleDateString() : new Date((article.submittedDate as any).seconds * 1000).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handlePublish(article.id)}
                    disabled={actionLoading === article.id || article.status === 'published'}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      article.status === 'published'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-300 disabled:opacity-50'
                    }`}
                  >
                    {actionLoading === article.id ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '✓ Publish'}
                  </button>
                  <button
                    onClick={() => handleReject(article.id)}
                    disabled={actionLoading === article.id || article.status === 'rejected'}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      article.status === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-300 disabled:opacity-50'
                    }`}
                  >
                    {actionLoading === article.id ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '✗ Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
