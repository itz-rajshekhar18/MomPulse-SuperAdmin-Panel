'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  getAllCommunityPosts, 
  getCommunityPostsBySection,
  getCommunityReportsDetailed,
  deleteCommunityPost,
  approveCommunityReport,
  rejectCommunityReport,
  type CommunityPost,
  type CommunityReport
} from '@/lib/moderation';
import { AlertCircle, CheckCircle, XCircle, Trash2, MessageSquare, Heart, Flag } from 'lucide-react';

export default function CommunityModerationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const sections = [
    { value: 'all', label: 'All Sections' },
    { value: 'period', label: 'Period' },
    { value: 'pre-pregnancy', label: 'Pre-Pregnancy' },
    { value: 'postpartum', label: 'Postpartum' },
    { value: 'general', label: 'General' },
  ];

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

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'posts') {
        fetchPosts();
      } else {
        fetchReports();
      }
    }
  }, [isAuthenticated, activeTab, selectedSection]);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      let data: CommunityPost[];
      
      if (selectedSection === 'all') {
        data = await getAllCommunityPosts();
      } else {
        data = await getCommunityPostsBySection(selectedSection);
      }
      
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const data = await getCommunityReportsDetailed();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, section: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setActionLoading(postId);
      await deleteCommunityPost(postId, section);
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveReport = async (reportId: string, postId: string, section: string) => {
    if (!confirm('This will remove the reported post. Continue?')) return;

    try {
      setActionLoading(reportId);
      await approveCommunityReport(reportId, postId, section);
      await fetchReports();
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await rejectCommunityReport(reportId);
      await fetchReports();
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Failed to reject report. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Community Moderation</h1>
              <p className="text-gray-600 mt-1">Manage community posts and reported content</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'posts'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  All Posts
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'reports'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Flag className="w-4 h-4 inline mr-2" />
                  Reported Content
                </button>
              </div>

              {/* Section Filter (only for posts tab) */}
              {activeTab === 'posts' && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Filter by section:</span>
                    <div className="flex gap-2">
                      {sections.map((section) => (
                        <button
                          key={section.value}
                          onClick={() => setSelectedSection(section.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedSection === section.value
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {activeTab === 'posts' ? (
                  // Posts Tab
                  <div>
                    {postsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : posts.length > 0 ? (
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <div key={post.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded uppercase">
                                    {post.section}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    by {post.userName || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(post.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-900 mb-2">{post.content}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {post.likes || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    {post.comments || 0}
                                  </span>
                                  {post.reported && (
                                    <span className="flex items-center gap-1 text-red-600">
                                      <Flag className="w-4 h-4" />
                                      {post.reportCount || 0} reports
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeletePost(post.id, post.section)}
                                disabled={actionLoading === post.id}
                                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                                title="Delete post"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No posts found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Reports Tab
                  <div>
                    {reportsLoading ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Content</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reason</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reporter</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Urgency</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i} className="border-b border-gray-200 animate-pulse">
                                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : reports.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Content</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reason</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reporter</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Urgency</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map((report) => (
                              <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-4 px-4 text-sm text-gray-900 max-w-md truncate">
                                  {report.postContent}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">{report.reason}</td>
                                <td className="py-4 px-4 text-sm text-gray-600">{report.reporterName || 'Anonymous'}</td>
                                <td className="py-4 px-4">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase ${getUrgencyColor(report.urgency)}`}>
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
                                <td className="py-4 px-4">
                                  {report.moderation === 'pending' && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleApproveReport(report.id, report.postId, 'general')}
                                        disabled={actionLoading === report.id}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition disabled:opacity-50"
                                      >
                                        Remove Post
                                      </button>
                                      <button
                                        onClick={() => handleRejectReport(report.id)}
                                        disabled={actionLoading === report.id}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition disabled:opacity-50"
                                      >
                                        Keep Post
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Flag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No reports found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
