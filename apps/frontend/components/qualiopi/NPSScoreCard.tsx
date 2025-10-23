/**
 * NPSScoreCard Component
 * Displays Net Promoter Score with visual indicator and category
 */

interface NPSScoreCardProps {
  score: number;
  promoters?: number;
  passives?: number;
  detractors?: number;
  showBreakdown?: boolean;
}

function getNPSCategory(score: number) {
  if (score >= 70) return { label: '🟢 Mükemmel', color: 'text-green-600 bg-green-50 border-green-200' };
  if (score >= 50) return { label: '🟡 İyi', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
  if (score >= 0) return { label: '🟠 Orta', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  return { label: '🔴 Kötü', color: 'text-red-600 bg-red-50 border-red-200' };
}

export default function NPSScoreCard({
  score,
  promoters = 0,
  passives = 0,
  detractors = 0,
  showBreakdown = true,
}: NPSScoreCardProps) {
  const category = getNPSCategory(score);
  const total = promoters + passives + detractors;

  // Calculate percentages
  const promotersPercent = total > 0 ? Math.round((promoters / total) * 100) : 0;
  const passivesPercent = total > 0 ? Math.round((passives / total) * 100) : 0;
  const detractorsPercent = total > 0 ? Math.round((detractors / total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Main NPS Display */}
      <div className={`border-2 rounded-lg p-6 ${category.color}`}>
        <div className="text-center">
          <p className="text-sm font-medium mb-2">Net Promoter Score</p>
          <div className="text-5xl font-bold mb-2">{score}</div>
          <p className="text-lg font-semibold">{category.label}</p>
        </div>

        {/* Visual gauge */}
        <div className="mt-6 flex justify-between items-end h-24 gap-2">
          {/* Detractors */}
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-red-600 rounded-t transition-all"
              style={{ height: `${Math.max(detractorsPercent * 2, 10)}px` }}
            ></div>
            <p className="text-xs font-medium mt-2 text-gray-600">Düşmek</p>
            <p className="text-sm font-bold text-gray-900">{detractorsPercent}%</p>
          </div>

          {/* Passives */}
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-yellow-600 rounded-t transition-all"
              style={{ height: `${Math.max(passivesPercent * 2, 10)}px` }}
            ></div>
            <p className="text-xs font-medium mt-2 text-gray-600">Nötr</p>
            <p className="text-sm font-bold text-gray-900">{passivesPercent}%</p>
          </div>

          {/* Promoters */}
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-green-600 rounded-t transition-all"
              style={{ height: `${Math.max(promotersPercent * 2, 10)}px` }}
            ></div>
            <p className="text-xs font-medium mt-2 text-gray-600">Tavsiye</p>
            <p className="text-sm font-bold text-gray-900">{promotersPercent}%</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && total > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Katılımcı Dağılımı</h4>

          {/* Promoters */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 text-center">
              <p className="text-lg font-bold text-green-600">{promoters}</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700">Tavsiye Edenler</p>
                <span className="text-xs text-gray-500">{promotersPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${promotersPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Passives */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 text-center">
              <p className="text-lg font-bold text-yellow-600">{passives}</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700">Nötrler</p>
                <span className="text-xs text-gray-500">{passivesPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-yellow-600 rounded-full"
                  style={{ width: `${passivesPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Detractors */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 text-center">
              <p className="text-lg font-bold text-red-600">{detractors}</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700">Düşen Katılımcılar</p>
                <span className="text-xs text-gray-500">{detractorsPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-red-600 rounded-full"
                  style={{ width: `${detractorsPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Toplam: {total} katılımcı
          </p>
        </div>
      )}
    </div>
  );
}

