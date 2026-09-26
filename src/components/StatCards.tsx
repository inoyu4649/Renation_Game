import React from 'react';
import { Baby, Compass, Dices, Percent, Users } from 'lucide-react';
import { ReincarnationResultData } from '../types';
import { formatKoreanNumber } from '../utils/formatters';

interface StatCardsProps {
  totalWorldBirths: number;
  totalWorldPopulation: number;
  currentResult: ReincarnationResultData | null;
  reincarnationCount: number;
  mode: 'birth' | 'population';
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalWorldBirths,
  totalWorldPopulation,
  currentResult,
  reincarnationCount,
  mode,
}) => {
  const stat1Title = mode === 'birth' ? '지구 연간 출생아' : '지구 총 인구';
  const stat1Value =
    mode === 'birth'
      ? formatKoreanNumber(totalWorldBirths || 132405927)
      : formatKoreanNumber(totalWorldPopulation || 8161972572);

  const countryName = currentResult
    ? currentResult.country.country_ko || currentResult.country.country
    : '환생 대기 중';

  const probabilityStr = currentResult
    ? `${(mode === 'birth'
        ? currentResult.country.birth_share_pct
        : currentResult.country.pop_share_pct
      ).toFixed(2)}%`
    : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Card 1: Total Baseline */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">{stat1Title}</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            {mode === 'birth' ? <Baby className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {stat1Value}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">UN WPP 2024 공식 데이터 기준</div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80" />
      </div>

      {/* Card 2: Current Life */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">배정된 국가</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight truncate">
          {countryName}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {currentResult ? currentResult.city.name : '새로운 생을 뽑아보세요'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
      </div>

      {/* Card 3: Probability */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">당첨 확률 (국가/도시)</span>
          <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {probabilityStr}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {currentResult
            ? `도시 최종 확률: ${currentResult.globalCityProbabilityPct ? currentResult.globalCityProbabilityPct.toFixed(4) : '0.00'}%`
            : '전 세계 지분율'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-400 opacity-80" />
      </div>

      {/* Card 4: Count */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">누적 환생 횟수</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Dices className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {reincarnationCount}{' '}
          <span className="text-sm font-semibold text-slate-400">회차</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">로컬 저장소 자동 기록</div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80" />
      </div>
    </div>
  );
};
