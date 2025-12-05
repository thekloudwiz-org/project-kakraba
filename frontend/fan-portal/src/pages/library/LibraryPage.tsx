import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Spinner, type Content, type PaginatedResponse } from '@kakraba/shared';
import ContentLibraryCard from '../../components/library/ContentLibraryCard';

type ContentFilter = 'all' | 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';

export default function LibraryPage() {
  const [filter, setFilter] = useState<ContentFilter>('all');
  const [page, setPage] = useState(1);

  const { data: library, isLoading } = useQuery<PaginatedResponse<Content> & { totalPages: number }>({
    queryKey: ['content-library', filter, page],
    queryFn: async () => {
      return await api.library.getAccessibleContent({
        contentType: filter === 'all' ? undefined : filter,
        page,
        limit: 12,
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Access all your purchased and subscribed content</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            <div className="flex space-x-2">
              {(['all', 'AUDIO', 'VIDEO', 'PDF', 'IMAGE'] as ContentFilter[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : library && library.items.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {library.items.map((content) => (
                <ContentLibraryCard key={content.contentId} content={content} />
              ))}
            </div>

            {/* Pagination */}
            {library.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {library.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(library.totalPages, p + 1))}
                  disabled={page === library.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your library is empty</h3>
            <p className="text-gray-600 mb-6">
              Purchase content or subscribe to creators to build your library
            </p>
            <button
              onClick={() => window.location.href = '/discover'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
