import { useState } from 'react';
import { Badge, Button } from '@kakraba/shared';
import MediaPlayer from './MediaPlayer';

interface ContentLibraryCardProps {
  content: {
    contentId: string;
    title: string;
    description?: string;
    contentType: string;
    thumbnailUrl?: string;
    creatorName: string;
    accessType: 'purchase' | 'subscription';
    downloadQuota?: number;
    downloadCount?: number;
    expiresAt?: string;
  };
}

export default function ContentLibraryCard({ content }: ContentLibraryCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  const canDownload = content.downloadQuota === undefined || 
                      (content.downloadCount || 0) < content.downloadQuota;

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'AUDIO': return '🎵';
      case 'VIDEO': return '🎬';
      case 'PDF': return '📄';
      case 'IMAGE': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow" data-testid="library-content-item">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
          {content.thumbnailUrl ? (
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">{getContentIcon(content.contentType)}</div>
          )}

          {/* Access Type Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={content.accessType === 'subscription' ? 'success' : 'default'} data-testid="access-type">
              {content.accessType === 'subscription' ? 'Subscription' : 'Purchased'}
            </Badge>
          </div>

          {/* Content Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="default" data-testid="content-type">{content.contentType}</Badge>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" data-testid="content-title">
            {content.title}
          </h3>

          {content.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {content.description}
            </p>
          )}

          <p className="text-sm text-gray-600 mb-3">by {content.creatorName}</p>

          {/* Download Quota */}
          {content.downloadQuota !== undefined && (
            <div className="mb-3 text-sm" data-testid="download-quota">
              <div className="flex items-center justify-between text-gray-600 mb-1">
                <span>Downloads:</span>
                <span>
                  {content.downloadCount || 0} / {content.downloadQuota}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    canDownload ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${((content.downloadCount || 0) / content.downloadQuota) * 100}%`,
                  }}
                />
              </div>
              {!canDownload && (
                <p className="text-xs text-red-600 mt-1">Download quota exhausted</p>
              )}
            </div>
          )}

          {/* Expiration */}
          {content.expiresAt && (
            <p className="text-xs text-gray-500 mb-3">
              Expires: {new Date(content.expiresAt).toLocaleDateString()}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {(content.contentType === 'AUDIO' || content.contentType === 'VIDEO') && (
              <Button
                onClick={() => setShowPlayer(true)}
                size="sm"
                className="flex-1"
                data-testid="stream-button"
              >
                Play
              </Button>
            )}
            <Button
              onClick={() => {
                // Handle download
                console.log('Download content:', content.contentId);
              }}
              size="sm"
              variant="secondary"
              className="flex-1"
              disabled={!canDownload}
              data-testid="download-button"
            >
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Media Player Modal */}
      {showPlayer && (
        <MediaPlayer
          contentId={content.contentId}
          contentType={content.contentType}
          title={content.title}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
}
