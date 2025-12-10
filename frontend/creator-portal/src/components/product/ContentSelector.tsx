import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Spinner, Badge } from '@kakraba/shared';

interface ContentSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function ContentSelector({ selectedIds, onSelectionChange }: ContentSelectorProps) {
  const [page, setPage] = useState(1);

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', page],
    queryFn: () => api.content.listContent({ page, limit: 12 }),
  });

  const handleToggle = (contentId: string) => {
    if (selectedIds.includes(contentId)) {
      onSelectionChange(selectedIds.filter(id => id !== contentId));
    } else {
      onSelectionChange([...selectedIds, contentId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const content = contentData?.items || [];
  const totalPages = Math.ceil((contentData?.total || 0) / 12);

  return (
    <div data-testid="content-selector" className="space-y-4">
      <div data-testid="selected-content" className="text-sm text-gray-400">
        {selectedIds.length} item(s) selected
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((item) => {
          const isSelected = selectedIds.includes(item.contentId);
          
          return (
            <div
              key={item.contentId}
              data-testid="content-item"
              onClick={() => handleToggle(item.contentId)}
              className={`
                bg-gray-900 rounded-lg p-4 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-2 border-purple-500 ring-2 ring-purple-500/20' 
                  : 'border border-gray-700 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-medium truncate">{item.title}</h3>
                  <Badge variant="default" className="mt-1">{item.contentType}</Badge>
                </div>
                <div
                  className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'bg-purple-600 border-purple-600' 
                      : 'border-gray-600'
                    }
                  `}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">
                {item.description || 'No description'}
              </p>
            </div>
          );
        })}
      </div>

      {content.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No content available. Upload content first.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
