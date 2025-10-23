import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

interface ChartPlaceholderProps {
  title: string;
  chartType: 'line' | 'bar' | 'pie' | 'area';
  data?: any[];
  loading?: boolean;
  className?: string;
  height?: string;
}

const chartIcons = {
  line: <LineChart className="w-8 h-8" />,
  bar: <BarChart3 className="w-8 h-8" />,
  pie: <PieChart className="w-8 h-8" />,
  area: <TrendingUp className="w-8 h-8" />,
};

export function ChartPlaceholder({
  title,
  chartType,
  data = [],
  loading = false,
  className = '',
  height = 'h-64',
}: ChartPlaceholderProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className={`${height} bg-gray-100 rounded-lg animate-pulse flex items-center justify-center`}>
          <div className="text-gray-400 text-sm">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="text-gray-400">{chartIcons[chartType]}</div>
        </div>
        <div className={`${height} bg-gray-50 rounded-lg flex flex-col items-center justify-center`}>
          <div className="text-gray-400 mb-2">{chartIcons[chartType]}</div>
          <p className="text-gray-500 text-sm">No data available</p>
          <p className="text-gray-400 text-xs mt-1">Chart will appear when data is available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-blue-600">{chartIcons[chartType]}</div>
      </div>
      <div className={`${height} bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center border border-blue-100`}>
        <div className="text-blue-600 mb-3">{chartIcons[chartType]}</div>
        <p className="text-blue-800 font-medium mb-1">Chart Ready</p>
        <p className="text-blue-600 text-sm text-center">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart will be rendered here
        </p>
        <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          {data.length} data points
        </div>
      </div>
    </div>
  );
}
