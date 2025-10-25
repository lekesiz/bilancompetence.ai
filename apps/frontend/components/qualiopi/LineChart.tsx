/**
 * LineChart Component
 * Simple line chart for trend visualization
 */

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  height?: string;
  showGrid?: boolean;
  colors?: string[];
  max?: number;
}

export default function LineChart({
  data,
  title,
  height = '300px',
  showGrid = true,
  colors = ['rgb(59, 130, 246)', 'rgb(239, 68, 68)'],
  max,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Veri bulunamadı</p>
      </div>
    );
  }

  const maxValue = max || Math.max(...data.map((d) => d.value), ...data.map((d) => d.secondaryValue || 0));
  const minValue = 0;
  const range = maxValue - minValue;

  const padding = 40;
  const width = 800;
  const chartWidth = width - 2 * padding;
  const chartHeight = 300 - 2 * padding;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth + padding,
    y: height.includes('px')
      ? parseInt(height) - (((d.value - minValue) / range) * chartHeight + padding)
      : 300 - (((d.value - minValue) / range) * chartHeight + padding),
  }));

  const secondaryPoints = data
    .filter((d) => d.secondaryValue !== undefined)
    .map((d, i) => ({
      x: (data.indexOf(d) / (data.length - 1)) * chartWidth + padding,
      y: height.includes('px')
        ? parseInt(height) - (((d.secondaryValue! - minValue) / range) * chartHeight + padding)
        : 300 - (((d.secondaryValue! - minValue) / range) * chartHeight + padding),
    }));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const secondaryPathData =
    secondaryPoints.length > 0
      ? secondaryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const chartHeightValue = height.includes('px') ? height : '300px';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>}

      <svg width={width} height={chartHeightValue} className="w-full h-auto">
        {/* Grid */}
        {showGrid && (
          <>
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={`h-${ratio}`}
                x1={padding}
                y1={parseInt(chartHeightValue) - chartHeight * ratio - padding}
                x2={width - padding}
                y2={parseInt(chartHeightValue) - chartHeight * ratio - padding}
                stroke="#e5e7eb"
                strokeDasharray="5,5"
              />
            ))}
            {data.map((_, i) => (
              <line
                key={`v-${i}`}
                x1={(i / (data.length - 1)) * chartWidth + padding}
                y1={padding}
                x2={(i / (data.length - 1)) * chartWidth + padding}
                y2={parseInt(chartHeightValue) - padding}
                stroke="#e5e7eb"
                strokeDasharray="5,5"
              />
            ))}
          </>
        )}

        {/* Primary Line */}
        <path d={pathData} stroke={colors[0]} strokeWidth="2" fill="none" />

        {/* Secondary Line */}
        {secondaryPathData && <path d={secondaryPathData} stroke={colors[1]} strokeWidth="2" fill="none" />}

        {/* Points */}
        {points.map((p, i) => (
          <g key={`primary-point-${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill={colors[0]} />
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke={colors[0]} strokeWidth="2" opacity="0.3" />
          </g>
        ))}

        {/* Secondary Points */}
        {secondaryPoints.map((p, i) => (
          <g key={`secondary-point-${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill={colors[1]} />
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke={colors[1]} strokeWidth="2" opacity="0.3" />
          </g>
        ))}

        {/* X-Axis Labels */}
        {data.map((d, i) => (
          <text
            key={`label-${i}`}
            x={(i / (data.length - 1)) * chartWidth + padding}
            y={parseInt(chartHeightValue) - padding + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            {d.label}
          </text>
        ))}

        {/* Y-Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <text
            key={`y-label-${ratio}`}
            x={padding - 10}
            y={parseInt(chartHeightValue) - chartHeight * ratio - padding}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="12"
            fill="#6b7280"
          >
            {Math.round((minValue + ratio * range) * 100) / 100}
          </text>
        ))}
      </svg>

      {/* Legend */}
      {(data.some((d) => d.secondaryValue !== undefined) || title) && (
        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Ana Değer</span>
          </div>
          {data.some((d) => d.secondaryValue !== undefined) && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[1] }}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">İkincil Değer</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
