import { Card } from '@kakraba/shared';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}

export default function MetricsCard({ title, value, icon, trend, trendUp }: MetricsCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  );
}
