/**
 * AnalyticsPanel Component Unit Tests
 *
 * Tests for:
 * - Chart rendering with ChartPlaceholder
 * - Different chart types
 * - Loading states
 * - Data handling
 * - Props passing
 */

import { render, screen } from '@testing-library/react';
import { AnalyticsPanel } from '@/app/(protected)/dashboard/components/dashboard-components/AnalyticsPanel';

// Mock ChartPlaceholder
jest.mock('@/app/(protected)/dashboard/components/dashboard-components/ChartPlaceholder', () => ({
  ChartPlaceholder: ({ title, chartType, data, loading }: any) => (
    <div data-testid="chart-placeholder">
      <h3>{title}</h3>
      <div data-testid="chart-type">{chartType}</div>
      <div data-testid="chart-data">{data ? data.length : 0} items</div>
      <div data-testid="chart-loading">{loading ? 'loading' : 'not-loading'}</div>
    </div>
  ),
}));

describe('AnalyticsPanel Component', () => {
  const mockData = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 150 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 175 },
    { name: 'May', value: 250 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render ChartPlaceholder with correct props', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Test Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-placeholder')).toBeInTheDocument();
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(screen.getByTestId('chart-type')).toHaveTextContent('line');
      expect(screen.getByTestId('chart-data')).toHaveTextContent('5 items');
    });

    it('should pass loading state correctly', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Test Chart"
          chartType="line"
          loading={true}
        />
      );

      expect(screen.getByTestId('chart-loading')).toHaveTextContent('loading');
    });

    it('should pass not loading state correctly', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Test Chart"
          chartType="line"
          loading={false}
        />
      );

      expect(screen.getByTestId('chart-loading')).toHaveTextContent('not-loading');
    });
  });

  describe('Chart Types', () => {
    it('should render line chart', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Line Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-type')).toHaveTextContent('line');
    });

    it('should render bar chart', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Bar Chart"
          chartType="bar"
        />
      );

      expect(screen.getByTestId('chart-type')).toHaveTextContent('bar');
    });

    it('should render pie chart', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Pie Chart"
          chartType="pie"
        />
      );

      expect(screen.getByTestId('chart-type')).toHaveTextContent('pie');
    });

    it('should render area chart', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Area Chart"
          chartType="area"
        />
      );

      expect(screen.getByTestId('chart-type')).toHaveTextContent('area');
    });
  });

  describe('Data Handling', () => {
    it('should handle empty data array', () => {
      render(
        <AnalyticsPanel
          data={[]}
          title="Empty Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-data')).toHaveTextContent('0 items');
    });

    it('should handle undefined data', () => {
      render(
        <AnalyticsPanel
          data={undefined as any}
          title="Undefined Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-data')).toHaveTextContent('0 items');
    });

    it('should handle single data point', () => {
      const singleData = [{ name: 'Jan', value: 100 }];
      
      render(
        <AnalyticsPanel
          data={singleData}
          title="Single Data Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-data')).toHaveTextContent('1 items');
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        name: `Month ${i + 1}`,
        value: i * 10,
      }));
      
      render(
        <AnalyticsPanel
          data={largeData}
          title="Large Dataset Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-data')).toHaveTextContent('100 items');
    });
  });

  describe('Default Props', () => {
    it('should use default loading state when not provided', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Default Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-loading')).toHaveTextContent('not-loading');
    });
  });

  describe('Props Passing', () => {
    it('should pass all props to ChartPlaceholder', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Props Test Chart"
          chartType="bar"
          loading={true}
        />
      );

      expect(screen.getByText('Props Test Chart')).toBeInTheDocument();
      expect(screen.getByTestId('chart-type')).toHaveTextContent('bar');
      expect(screen.getByTestId('chart-data')).toHaveTextContent('5 items');
      expect(screen.getByTestId('chart-loading')).toHaveTextContent('loading');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with existing usage', () => {
      // This test ensures the component works as expected with existing code
      render(
        <AnalyticsPanel
          data={mockData}
          title="Compatibility Test"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-placeholder')).toBeInTheDocument();
      expect(screen.getByText('Compatibility Test')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data gracefully', () => {
      render(
        <AnalyticsPanel
          data={null as any}
          title="Null Data Chart"
          chartType="line"
        />
      );

      expect(screen.getByTestId('chart-data')).toHaveTextContent('0 items');
    });

    it('should handle invalid chart type gracefully', () => {
      render(
        <AnalyticsPanel
          data={mockData}
          title="Invalid Chart"
          chartType="invalid" as any
        />
      );

      expect(screen.getByTestId('chart-type')).toHaveTextContent('invalid');
    });
  });

  describe('Performance', () => {
    it('should render efficiently with large datasets', () => {
      const startTime = performance.now();
      
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 100,
      }));
      
      render(
        <AnalyticsPanel
          data={largeData}
          title="Performance Test"
          chartType="line"
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('chart-data')).toHaveTextContent('1000 items');
    });
  });
});
