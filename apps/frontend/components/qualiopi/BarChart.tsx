/**
 * BarChart Component
 * Displays horizontal or vertical bar charts with data
 */

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  direction?: 'vertical' | 'horizontal';
  max?: number;
  showValues?: boolean;
  height?: string;
}

export default function BarChart({
  data,
  title,
  direction = 'vertical',
  max,
  showValues = true,
  height = '300px',
}: BarChartProps) {
  const maxValue = max || Math.max(...data.map((d) => d.value));

  if (direction === 'horizontal') {
    return (
      <div role="region" aria-label={title || 'Bar chart'}>
        {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">{item.label}</label>
                {showValues && (
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    item.color || 'bg-blue-600'
                  }`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={item.value}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(maxValue)}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical bars
  return (
    <div role="region" aria-label={title || 'Bar chart'}>
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <div style={{ height }}>
        <div className="flex items-end justify-around h-full gap-3 pb-4">
          {data.map((item, idx) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2"
                role="group"
                aria-label={item.label}
              >
                <div className="flex items-end h-64 w-full justify-center">
                  <div
                    className={`w-full max-w-16 transition-all duration-500 rounded-t ${
                      item.color || 'bg-blue-600'
                    } hover:opacity-80 cursor-pointer`}
                    style={{ height: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={item.value}
                    aria-valuemin={0}
                    aria-valuemax={Math.round(maxValue)}
                    title={`${item.label}: ${item.value}`}
                  ></div>
                </div>
                <div className="text-center">
                  {showValues && (
                    <div className="text-sm font-bold text-gray-900">{item.value}</div>
                  )}
                  <label className="text-xs text-gray-600 truncate w-full px-1">
                    {item.label}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

