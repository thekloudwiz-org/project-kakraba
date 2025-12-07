import { useQuery } from '@tanstack/react-query';
import { api, Modal, Spinner, Badge } from '@kakraba/shared';

interface ContentPreviewProps {
  contentId: string;
  onClose: () => void;
}

export default function ContentPreview({ contentId, onClose }: ContentPreviewProps) {
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => api.content.getContent(contentId),
  });

  return (
    <Modal isOpen={true} onClose={onClose} title="Content Preview">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : content ? (
        <div className="space-y-4" data-testid="content-details">
          {/* Thumbnail/Preview */}
          <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
            {content.thumbnailUrl ? (
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-6xl">
                {content.contentType === 'AUDIO' && '🎵'}
                {content.contentType === 'VIDEO' && '🎬'}
                {content.contentType === 'PDF' && '📄'}
                {content.contentType === 'IMAGE' && '🖼️'}
              </div>
            )}
          </div>

          {/* Content Details */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white">{content.title}</h3>
              <Badge variant="default" className="mt-2">{content.contentType}</Badge>
            </div>

            {content.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Description</h4>
                <p className="text-white">{content.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">File Size</h4>
                <p className="text-white">
                  {(content.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Uploaded</h4>
                <p className="text-white">
                  {new Date(content.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {content.duration && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Duration</h4>
                  <p className="text-white">{Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Content not found
        </div>
      )}
    </Modal>
  );
}
