import { Indicator } from '../types';

interface IndicatorBoardProps {
  indicators: Indicator[];
  onSelectIndicator: (indicator: Indicator) => void;
  onRefresh: () => void;
}

export default function IndicatorBoard({
  indicators,
  onSelectIndicator,
  onRefresh,
}: IndicatorBoardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'MISSING':
        return 'bg-red-100 border-red-300 text-red-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900 dark:text-white';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <span className="inline-block px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold">✅ Uyumlu</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold">🔄 İnceleme</span>;
      case 'MISSING':
        return <span className="inline-block px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-semibold">❌ Eksik</span>;
      default:
        return null;
    }
  };

  if (indicators.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">Gösterge bulunamadı</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Yenile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators.map((indicator) => (
          <div
            key={indicator.indicator_id}
            onClick={() => onSelectIndicator(indicator)}
            className={`border-2 rounded-lg p-6 cursor-pointer transition hover:shadow-lg ${getStatusColor(
              indicator.status
            )}`}
          >
            {/* Indicator Number and Name */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold opacity-75">
                  Gösterge #{indicator.indicator_id}
                </div>
                <h3 className="text-lg font-bold mt-1">{indicator.name}</h3>
              </div>
              {getStatusBadge(indicator.status)}
            </div>

            {/* Evidence Count */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="text-sm font-medium">
                {indicator.evidence_count} kanıt dosyası
              </span>
            </div>

            {/* Last Reviewed */}
            {indicator.last_reviewed_at && (
              <div className="text-xs opacity-75">
                Son İnceleme: {new Date(indicator.last_reviewed_at).toLocaleDateString('tr-TR')}
                {indicator.reviewed_by_name && ` - ${indicator.reviewed_by_name}`}
              </div>
            )}

            {/* Click to see details */}
            <button className="mt-4 w-full px-3 py-2 bg-opacity-20 bg-white dark:bg-gray-800 text-inherit rounded font-medium hover:bg-opacity-40 transition">
              Detayları Gör
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

