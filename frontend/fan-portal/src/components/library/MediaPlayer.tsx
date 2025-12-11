import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Modal, Spinner } from '@kakraba/shared';
import CustomMediaControls from './CustomMediaControls';

interface MediaPlayerProps {
  contentId: string;
  contentType: string;
  title: string;
  onClose: () => void;
}

export default function MediaPlayer({ contentId, contentType, title, onClose }: MediaPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUrlExpired, setIsUrlExpired] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get signed URL for streaming
  const { data: streamUrl, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['stream-url', contentId],
    queryFn: async () => {
      const result = await api.content.getStreamUrl(contentId);
      return result as { url: string; expiresAt: string };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRefreshUrl = async () => {
    setError(null);
    setIsUrlExpired(false);
    await refetch();
  };

  useEffect(() => {
    if (streamUrl && streamUrl.expiresAt) {
      const expiresAt = new Date(streamUrl.expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry > 0) {
        const timer = setTimeout(() => {
          setIsUrlExpired(true);
          setError('Stream URL has expired. Please refresh to continue watching.');
        }, timeUntilExpiry);

        return () => clearTimeout(timer);
      } else {
        // URL is already expired
        setIsUrlExpired(true);
        setError('Stream URL has expired. Please refresh to continue watching.');
      }
    }
  }, [streamUrl]);

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="large" data-testid="media-player">
      {isLoading || isRefetching ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6" data-testid="url-expired-error">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">Stream Error</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              {isUrlExpired && (
                <button
                  onClick={handleRefreshUrl}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  data-testid="refresh-url-button"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Stream
                </button>
              )}
            </div>
          </div>
        </div>
      ) : streamUrl ? (
        <div className="space-y-4">
          {/* Content metadata */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900" data-testid="player-content-title">{title}</h2>
          </div>

          {contentType === 'VIDEO' ? (
            <div className="space-y-4">
              <video
                ref={videoRef}
                src={streamUrl.url}
                autoPlay
                className="w-full rounded-lg bg-black"
                onError={(e) => {
                  const videoElement = e.currentTarget;
                  // Check if error might be due to expired URL
                  if (videoElement.error && (videoElement.error.code === 4 || videoElement.error.code === 2)) {
                    setIsUrlExpired(true);
                    setError('Failed to load video. The stream URL may have expired. Please refresh.');
                  } else {
                    setError('Failed to load video. Please try again.');
                  }
                }}
                data-testid="video-player"
              >
                Your browser does not support the video tag.
              </video>
              <CustomMediaControls mediaRef={videoRef} />
            </div>
          ) : contentType === 'AUDIO' ? (
            <div className="bg-gray-100 rounded-lg p-8 space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={streamUrl.url}
                autoPlay
                className="hidden"
                onError={(e) => {
                  const audioElement = e.currentTarget;
                  // Check if error might be due to expired URL
                  if (audioElement.error && (audioElement.error.code === 4 || audioElement.error.code === 2)) {
                    setIsUrlExpired(true);
                    setError('Failed to load audio. The stream URL may have expired. Please refresh.');
                  } else {
                    setError('Failed to load audio. Please try again.');
                  }
                }}
                data-testid="audio-player"
              >
                Your browser does not support the audio tag.
              </audio>
              <CustomMediaControls mediaRef={audioRef} />
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
