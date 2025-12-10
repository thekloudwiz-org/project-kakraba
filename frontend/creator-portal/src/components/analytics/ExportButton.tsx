import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, Button } from '@kakraba/shared';

interface ExportButtonProps {
  startDate?: string;
  endDate?: string;
}

export default function ExportButton({ startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = useMutation({
    mutationFn: () => api.analytics.exportAnalytics({
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      type: 'revenue',
    }),
    onSuccess: (blob) => {
      // Create URL from blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsExporting(false);
    },
    onError: () => {
      setIsExporting(false);
    },
  });

  const handleExport = () => {
    setIsExporting(true);
    exportMutation.mutate();
  };

  return (
    <Button
      onClick={handleExport}
      isLoading={isExporting}
      variant="secondary"
      data-testid="export-button"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export CSV
    </Button>
  );
}
