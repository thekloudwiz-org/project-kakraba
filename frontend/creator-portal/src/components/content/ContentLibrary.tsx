import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, Spinner, Badge, Modal, Button } from '@kakraba/shared';
import ContentEditor from './ContentEditor';
import ContentPreview from './ContentPreview';

type ViewMode = 'grid' | 'list';
type ContentType = 'ALL' | 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';

export default function ContentLibrary() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<ContentType>('ALL');
  const [page, setPage] = useState(1);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [deletingContent, setDeletingContent] = useState<string | null>(null);

  const { data: contentData, isLoading, refetch } = useQuery({
    queryKey: ['content', page, filterType],
    queryFn: () => api.content.listContent({
      page,
      limit: 12,
      contentType: filterType === 'ALL' ? undefined : filterType,
    }),
  });

  const handleEdit = (contentId: string) => {
    setEditingContent(contentId);
  };

  const handlePreview = (contentId: string) => {
    setSelectedContent(contentId);
  };

  const handleEditComplete = () => {
    setEditingContent(null);
    refetch();
  };

  const deleteMutation = useMutation({
    mutationFn: (contentId: string) => api.content.deleteContent(contentId),
    onSuccess: () => {
      setDeletingContent(null);
      refetch();
    },
  });

  const handleDelete = (contentId: string) => {
    setDeletingContent(contentId);
  };

  const confirmDelete = () => {
    if (deletingContent) {
      deleteMutation.mutate(deletingContent);
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
    <div className="space-y-6">
      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            data-testid="content-type-filter"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as ContentType);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="ALL">All Content</option>
            <option value="AUDIO">Audio</option>
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
            <option value="IMAGE">Images</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Grid/List */}
      {content.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No content found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="content-grid">
          {content.map((item) => (
            <div
              key={item.contentId}
              data-testid="content-item"
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl">
                    {item.contentType === 'AUDIO' && '🎵'}
                    {item.contentType === 'VIDEO' && '🎬'}
                    {item.contentType === 'PDF' && '📄'}
                    {item.contentType === 'IMAGE' && '🖼️'}
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium truncate flex-1">
                    {item.title}
                  </h3>
                  <Badge variant="default" data-testid="content-type">{item.contentType}</Badge>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {item.description || 'No description'}
                </p>
                <div className="text-xs text-gray-500">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() => handlePreview(item.contentId)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Preview
                  </button>
                  <button
                    data-testid="edit-button"
                    onClick={() => handleEdit(item.contentId)}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    data-testid="delete-button"
                    onClick={() => handleDelete(item.contentId)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="content-grid">
          {content.map((item) => (
            <div
              key={item.contentId}
              data-testid="content-item"
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-purple-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-3xl">
                    {item.contentType === 'AUDIO' && '🎵'}
                    {item.contentType === 'VIDEO' && '🎬'}
                    {item.contentType === 'PDF' && '📄'}
                    {item.contentType === 'IMAGE' && '🖼️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-400">
                      {item.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="default" data-testid="content-type">{item.contentType}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreview(item.contentId)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Preview
                  </button>
                  <button
                    data-testid="edit-button"
                    onClick={() => handleEdit(item.contentId)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    data-testid="delete-button"
                    onClick={() => handleDelete(item.contentId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2" data-testid="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            data-testid="next-page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {editingContent && (
        <ContentEditor
          contentId={editingContent}
          onClose={() => setEditingContent(null)}
          onSave={handleEditComplete}
        />
      )}

      {selectedContent && (
        <ContentPreview
          contentId={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingContent && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingContent(null)}
          title="Delete Content"
        >
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to delete this content? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingContent(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
