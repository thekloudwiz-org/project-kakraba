import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Modal, Spinner } from '@kakraba/shared';

interface MediaPlayerProps {
  contentId: string;
  contentType: string;
  title: string;
  onClose: () => void;
}

export default function MediaPlayer({ contentId, contentType, title, onClose }: MediaPlayerProps) {
  const [error, setError] = useState<string | null>(null);

  // Get signed URL for streaming
  const { data: streamUrl, isLoading } = useQuery({
    queryKey: ['stream-url', contentId],
    queryFn: async () => {
      const result = await api.content.getStreamUrl(contentId);
      return result as { url: string; expiresAt: string };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (streamUrl && streamUrl.expiresAt) {
      const expiresAt = new Date(streamUrl.expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry > 0) {
        const timer = setTimeout(() => {
          setError('Stream URL has expired. Please close and reopen the player.');
        }, timeUntilExpiry);

        return () => clearTimeout(timer);
      }
    }
  }, [streamUrl]);

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="large">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : streamUrl ? (
        <div className="space-y-4">
          {contentType === 'VIDEO' ? (
            <video
              src={streamUrl.url}
              controls
              autoPlay
              className="w-full rounded-lg"
              onError={() => setError('Failed to load video. Please try again.')}
            >
              Your browser does not support the video tag.
            </video>
          ) : contentType === 'AUDIO' ? (
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
              </div>
              <audio
                src={streamUrl.url}
                controls
                autoPlay
                className="w-full"
                onError={() => setError('Failed to load audio. Please try again.')}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              Unsupported content type for streaming
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Streaming Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This stream is secure and will expire in 15 minutes</li>
                  <li>Streaming does not count against your download quota</li>
                  <li>You can stream this content as many times as you want</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          Failed to load content. Please try again.
        </div>
      )}
    </Modal>
  );
}
