import React, { useState } from 'react';
import { History, RotateCcw, Award, ChevronRight, ListFilter } from 'lucide-react';
import { ReincarnationResultData } from '../types';

interface HistoryDashboardProps {
  history: ReincarnationResultData[];
  onReset: () => void;
  onSelectHistoryItem: (item: ReincarnationResultData) => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  history,
  onReset,
  onSelectHistoryItem,
}) => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Recent 6 reincarnation chain
  const recentChain = history
    .slice(0, 6)
    .reverse()
    .map((item) => item.country.country_ko || item.country.country);

  // Tier statistics
  const tierCounts = history.reduce<Record<string, number>>((acc, item) => {
    const tier = item.country.tier || '기타';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 mb-8">
      {/* Recent Journey Trail */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
          <History className="w-3.5 h-3.5 text-indigo-600" />
          <span>최근 환생 여정 히스토리</span>
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-900 overflow-x-auto whitespace-nowrap pb-1 flex items-center gap-2">
          {recentChain.length === 0 ? (
            <span className="text-slate-400 font-normal text-sm">
              아직 환생 기록이 없습니다. 상단의 버튼을 눌러 새로운 생을 시작하세요.
            </span>
          ) : (
            recentChain.map((country, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 font-light">→</span>}
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60 font-extrabold text-xs sm:text-sm">
                  {country}
                </span>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Reincarnation Destiny Dashboard */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>윤회의 기록보관소</span>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  누적 {history.length}회차
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                당신의 모든 전생 데이터가 브라우저에 보관됩니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>{showAllHistory ? '간략히' : '전체 목록'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('지금까지의 모든 환생 기록을 초기화하시겠습니까?')) {
                    onReset();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>기록 초기화</span>
              </button>
            </div>
          </div>

          {/* Tier Counts Badges */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-4">
            {[
              { tier: '천국', label: '✨ 천국', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { tier: '이지', label: '💎 이지', color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { tier: '보통', label: '⚖️ 보통', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { tier: '하드', label: '🔥 하드', color: 'text-orange-700 bg-orange-50 border-orange-200' },
              { tier: '지옥', label: '💀 지옥', color: 'text-red-700 bg-red-50 border-red-200' },
              { tier: '불지옥', label: '☠️ 불지옥', color: 'text-purple-700 bg-purple-50 border-purple-200' },
            ].map(({ tier, label, color }) => (
              <div
                key={tier}
                className={`rounded-xl p-2.5 text-center border ${color}`}
              >
                <div className="text-[11px] font-bold opacity-80">{label}</div>
                <div className="text-sm font-black mt-0.5">
                  {tierCounts[tier] || 0}
                  <span className="text-[10px] font-normal opacity-70 ml-0.5">회</span>
                </div>
              </div>
            ))}
          </div>

          {/* History List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(showAllHistory ? history : history.slice(0, 5)).map((item, idx) => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectHistoryItem(item)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-300 transition-all cursor-pointer text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-7">
                      #{history.length - idx}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{item.country.country_ko || item.country.country}</span>
                        <span className="text-slate-400 font-normal">·</span>
                        <span className="text-indigo-600 font-medium">{item.city.name}</span>
                        {item.city.is_capital && item.city.is_largest_city ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                            👑 수도·최대도시
                          </span>
                        ) : item.city.is_capital ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                            🏛️ 수도
                          </span>
                        ) : item.city.is_largest_city ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            🌟 최대도시
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span>{dateStr}</span>
                        <span>·</span>
                        <span>{item.mode === 'birth' ? '출생아' : '인구'}</span>
                        <span>·</span>
                        <span className="text-indigo-600 font-semibold">
                          국가 {item.countryProbabilityPct ?? item.country.birth_share_pct}% (도시 {item.globalCityProbabilityPct ? `${item.globalCityProbabilityPct}%` : '-'})
                        </span>
                        {item.city.nearest_major_city && item.calculatedDistanceKm && item.calculatedDistanceKm > 0 ? (
                          <>
                            <span>·</span>
                            <span>대도시 {item.city.nearest_major_city.name} ({item.calculatedDistanceKm}km)</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {item.country.tier}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
