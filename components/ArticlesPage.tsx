'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Flag, Eye, Loader } from 'lucide-react';
import { getArticleRequests, publishArticleRequest, rejectArticleRequest } from '@/lib/moderation';
import type { ArticleRequest } from '@/lib/moderation';

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'rejected' | 'flagged'>('all');
  const [articles, setArticles] = useState<ArticleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch articles on mount and when filter changes
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const status = filterStatus === 'all' ? undefined : (filterStatus as 'pending' | 'published' | 'rejected' | 'flagged');
        const data = await getArticleRequests(status);
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [filterStatus]);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = articles.filter((a) => a.status === 'pending').length;
  const flaggedCount = articles.filter((a) => a.status === 'flagged').length;

  const handlePublish = async (articleId: string) => {
    setActionLoading(articleId);
    try {
      const success = await publishArticleRequest(articleId);
      if (success) {
        setArticles(articles.map((a) => (a.id === articleId ? { ...a, status: 'published' } : a)));
      }
    } catch (error) {
      console.error('Error publishing article:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (articleId: string) => {
    setActionLoading(articleId);
    try {
      const success = await rejectArticleRequest(articleId);
      if (success) {
        setArticles(articles.map((a) => (a.id === articleId ? { ...a, status: 'rejected' } : a)));
      }
    } catch (error) {
      console.error('Error rejecting article:', error);
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
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      published: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
      flagged: 'bg-orange-100 text-orange-800 border border-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBgColor = (index: number) => {
    const colors = ['bg-teal-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'];
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
