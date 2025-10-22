import { useMemo } from 'react';
import { ChartDataPoint } from '../../types';

interface AnalyticsPanelProps {
  data: ChartDataPoint[];
  title: string;
  chartType: 'line' | 'bar' | 'pie';
  loading?: boolean;
}

/**
 * Simple analytics panel with ASCII/CSS-based visualization
 * Using CSS bars and simple charts to avoid external charting library dependency
 */
export function AnalyticsPanel({ data, title, chartType, loading = false }: AnalyticsPanelProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  // Bar chart
  if (chartType === 'bar') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="space-y-6">
          {data.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Line chart (simplified representation)
  if (chartType === 'line') {
    const height = 160;
    const points = data.map((d, idx) => ({
      x: (idx / (data.length - 1 || 1)) * 100,
      y: height - (d.value / maxValue) * height,
      ...d,
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <svg viewBox="0 0 100 160" className="w-full h-64" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((line) => (
                <line
                  key={line}
                  x1="0"
                  y1={height - (line / 100) * height}
                  x2="100"
                  y2={height - (line / 100) * height}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              ))}

              {/* Line */}
              <path d={pathData} stroke="#3b82f6" strokeWidth="2" fill="none" />

              {/* Points */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#3b82f6" />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-col justify-between py-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">MAX</p>
              <p className="text-lg font-bold text-gray-900">{maxValue}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">MIN</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.min(...data.map((d) => d.value))}
              </p>
            </div>
          </div>
        </div>

        {/* Data labels */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.slice(0, 4).map((item, idx) => (
            <div key={idx} className="text-xs">
              <span className="text-gray-600">{item.name}:</span>
              <span className="font-semibold text-gray-900 ml-1">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Pie chart
  if (chartType === 'pie') {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#14b8a6',
      '#d97706',
    ];

    let cumulativePercent = 0;
    const segments = data.map((item, idx) => {
      const percent = (item.value / total) * 100;
      const radius = 50;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (percent / 100) * circumference;
      const rotation = (cumulativePercent / 100) * 360;

      cumulativePercent += percent;

      return { item, percent, rotation, strokeDashoffset, color: colors[idx % colors.length] };
    });

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
        <div className="flex gap-8">
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <svg viewBox="0 0 120 120" className="w-40 h-40">
              {segments.map((seg, idx) => {
                const radius = 45;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (seg.percent / 100) * circumference;
                const rotate = segments.slice(0, idx).reduce((sum, s) => sum + s.percent, 0);

                return (
                  <circle
                    key={idx}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(${(rotate / 100) * 360} 60 60)`}
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1">
            <div className="space-y-2">
              {segments.map((seg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{seg.item.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {seg.percent.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
