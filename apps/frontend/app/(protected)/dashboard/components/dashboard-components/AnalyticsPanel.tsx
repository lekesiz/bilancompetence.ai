import { ChartDataPoint } from '../../types';
import { ChartPlaceholder } from './ChartPlaceholder';

interface AnalyticsPanelProps {
  data: ChartDataPoint[];
  title: string;
  chartType: 'line' | 'bar' | 'pie' | 'area';
  loading?: boolean;
}

/**
 * Analytics panel that uses ChartPlaceholder for consistent design
 * This maintains backward compatibility while using the modern ChartPlaceholder component
 */
export function AnalyticsPanel({ data, title, chartType, loading = false }: AnalyticsPanelProps) {
  return (
    <ChartPlaceholder
      title={title}
      chartType={chartType}
      data={data}
      loading={loading}
      height="h-64"
    />
  );
}
