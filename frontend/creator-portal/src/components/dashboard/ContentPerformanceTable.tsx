import { useQuery } from '@tanstack/react-query';
import { api, Spinner } from '@kakraba/shared';

export default function ContentPerformanceTable() {
  const { data: contentPerformance, isLoading } = useQuery({
    queryKey: ['content-performance'],
    queryFn: () => api.analytics.getContentPerformance(),
  });

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Content Performance</h3>

      <div className="overflow-x-auto">
        <table className="w-full" data-testid="content-performance-table">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                Content
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                Views
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                Downloads
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {contentPerformance?.map((content) => (
              <tr key={content.contentId} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3 px-4 text-white">{content.title}</td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {content.views.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {content.downloads.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-green-400 font-semibold">
                  ${content.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!contentPerformance || contentPerformance.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          No content performance data available
        </div>
      )}
    </div>
  );
}
