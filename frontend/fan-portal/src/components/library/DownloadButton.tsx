import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Button } from '@kakraba/shared';

interface DownloadButtonProps {
  contentId: string;
  title: string;
  downloadQuota?: number;
  downloadCount?: number;
  disabled?: boolean;
}

export default function DownloadButton({
  contentId,
  title,
  downloadQuota,
  downloadCount = 0,
  disabled,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const canDownload = downloadQuota === undefined || downloadCount < downloadQuota;

  const downloadMutation = useMutation({
    mutationFn: async () => {
      // Get signed download URL
      const response = await api.content.getDownloadUrl(contentId);
      return response as { url: string; expiresAt: string };
    },
    onSuccess: async (data) => {
      try {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.url;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Invalidate library query to refresh download count
        queryClient.invalidateQueries({ queryKey: ['content-library'] });
      } catch (err) {
        setError('Failed to download file. Please try again.');
      } finally {
        setIsDownloading(false);
      }
    },
    onError: (err: any) => {
      setError(err.message || 'Download failed. Please try again.');
      setIsDownloading(false);
    },
  });

  const handleDownload = async () => {
    if (!canDownload) {
      setError('Download quota exhausted. Please contact support or upgrade your plan.');
      return;
    }

    setError(null);
    setIsDownloading(true);
    downloadMutation.mutate();
  };

  return (
    <div>
      <Button
        onClick={handleDownload}
        disabled={disabled || !canDownload || isDownloading}
        isLoading={isDownloading}
        size="sm"
        variant="secondary"
      >
        {isDownloading ? 'Downloading...' : 'Download'}
      </Button>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}

      {!canDownload && downloadQuota !== undefined && (
        <p className="text-xs text-red-600 mt-1">
          Download quota exhausted ({downloadCount}/{downloadQuota})
        </p>
      )}
    </div>
  );
}
