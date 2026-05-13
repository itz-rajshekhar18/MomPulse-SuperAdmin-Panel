'use client';

import { BookOpen } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  image: string;
  status: 'pending' | 'published' | 'rejected';
}

export default function ArticleModerationQueue() {
  const articles: Article[] = [
    {
      id: '1',
      title: 'First Trimester: Essential Vitamins for...',
      category: 'NUTRITION',
      image: 'bg-teal-500',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Mindful Meditation for Expectant Mothers',
      category: 'WELLNESS',
      image: 'bg-green-500',
      status: 'published',
    },
    {
      id: '3',
      title: 'Pelvic Floor Health During Late Pregnancy',
      category: 'EXERCISE',
      image: 'bg-purple-500',
      status: 'pending',
    },
    {
      id: '4',
      title: 'The Ultimate Guide to Pregnancy Cravings',
      category: 'NUTRITION',
      image: 'bg-amber-500',
      status: 'published',
    },
  ];

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
        {articles.map((article) => (
          <div key={article.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition">
            {/* Image */}
            <div className={`${article.image} h-32 flex items-center justify-center`}>
              <BookOpen className="w-8 h-8 text-white opacity-50" />
            </div>

            {/* Content */}
            <div className="p-4">
              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded mb-2">
                {article.category}
              </span>
              <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-3">{article.title}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition ${
                    article.status === 'published'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {article.status === 'published' ? 'Publish' : 'Publish'}
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
