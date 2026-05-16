'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getRecentArticlesForModeration } from '@/lib/dashboard';
import { approveDoctorContent, rejectDoctorContent } from '@/lib/moderation';

interface Article {
  id: string;
  title: string;
  category: string;
  image: string | null;
  status: 'pending' | 'published' | 'rejected';
}

export default function ArticleModerationQueue() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getRecentArticlesForModeration();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles for moderation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (articleId: string) => {
    try {
      setActionLoading(articleId);
      await approveDoctorContent(articleId);
      // Refresh the list after publishing
      await fetchArticles();
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Failed to publish article. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (articleId: string) => {
    try {
      setActionLoading(articleId);
      await rejectDoctorContent(articleId);
      // Refresh the list after rejection
      await fetchArticles();
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Failed to reject article. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      NUTRITION: 'bg-teal-500',
      WELLNESS: 'bg-green-500',
      EXERCISE: 'bg-purple-500',
      PREGNANCY: 'bg-pink-500',
      POSTPARTUM: 'bg-blue-500',
      GENERAL: 'bg-amber-500',
    };
    return colors[category.toUpperCase()] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Article Moderation Queue</h3>
          <p className="text-sm text-gray-600">Awaiting review from community moderators</p>
        </div>
        <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          View all articles →
        </a>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-32"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition">
              {/* Image */}
              <div className={`${article.image || getCategoryColor(article.category)} h-32 flex items-center justify-center bg-cover bg-center`}>
                {!article.image && <BookOpen className="w-8 h-8 text-white opacity-50" />}
                {article.image && (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to colored background if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded mb-2">
                  {article.category}
                </span>
                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-3" title={article.title}>
                  {article.title}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePublish(article.id)}
                    disabled={actionLoading === article.id || article.status === 'published'}
                    className={`flex-1 px-3 py-2 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      article.status === 'published'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-purple-600 hover:text-white'
                    }`}
                  >
                    {actionLoading === article.id ? 'Processing...' : article.status === 'published' ? 'Published' : 'Publish'}
                  </button>
                  <button 
                    onClick={() => handleReject(article.id)}
                    disabled={actionLoading === article.id || article.status === 'rejected'}
                    className={`flex-1 px-3 py-2 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      article.status === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {actionLoading === article.id ? 'Processing...' : article.status === 'rejected' ? 'Rejected' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="col-span-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No articles pending moderation</p>
              <p className="text-xs text-gray-400 mt-1">Articles awaiting review will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
