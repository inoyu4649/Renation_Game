import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Scale,
  Users2,
  Sparkles,
  MapPin,
  Check,
  Copy,
  Building2,
  Percent,
  Crown,
  Landmark,
} from 'lucide-react';
import { ReincarnationResultData } from '../types';
import { formatKoreanNumber, formatOdds } from '../utils/formatters';

interface ReincarnationResultProps {
  result: ReincarnationResultData | null;
  mode: 'birth' | 'population';
}

const TIER_BADGES: Record<
  string,
  { label: string; bg: string; text: string; border: string; glow: string }
> = {
  천국: {
    label: '✨ 천국 (SSS Tier)',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
  },
  이지: {
    label: '💎 이지 (A Tier)',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
  보통: {
    label: '⚖️ 보통 (B Tier)',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  하드: {
    label: '🔥 하드 (C Tier)',
    bg: 'bg-orange-500/10',
    text: 'text-orange-700',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
  },
  지옥: {
    label: '💀 지옥 (D Tier)',
    bg: 'bg-red-500/10',
    text: 'text-red-700',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
  },
  불지옥: {
    label: '☠️ 불지옥 (F Tier)',
    bg: 'bg-purple-500/10',
    text: 'text-purple-700',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
  },
};

export const ReincarnationResult: React.FC<ReincarnationResultProps> = ({
  result,
  mode,
}) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) {
      setTypedTitle('');
      setIsTypingDone(false);
      return;
    }

    const countryKo = result.country.country_ko || result.country.country;
    const isCap = Boolean(result.city.is_capital || result.city.capital === 'primary');
    const isLargest = Boolean(result.city.is_largest_city);

    let cityTitlePrefix = '';
    if (isCap && isLargest) {
      cityTitlePrefix = '수도이자 최대도시 ';
    } else if (isCap) {
      cityTitlePrefix = '수도 ';
    } else if (isLargest) {
      cityTitlePrefix = '최대도시 ';
    }

    const fullText = `당신은 이번 생에 [${countryKo}]의 ${cityTitlePrefix}[${result.city.name}]에서 다시 태어났습니다!`;

    setTypedTitle('');
    setIsTypingDone(false);

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setTypedTitle(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [result]);

  if (!result) {
    return null;
  }

  const { country, city, calculatedDistanceKm } = result;

  const isCap = Boolean(city.is_capital || city.capital === 'primary');
  const isLargest = Boolean(city.is_largest_city);
  const isAlreadyMajor = Boolean(
    isCap || isLargest || city.is_major_city || !city.nearest_major_city
  );

  const countryProb =
    result.countryProbabilityPct !== undefined
      ? result.countryProbabilityPct
      : (mode === 'birth' ? country.birth_share_pct : country.pop_share_pct);

  const cityPop = city.population || city.weight || 1000;
  const countryPop = Math.max(country.population, cityPop);

  const cityInCountryProb =
    result.cityInCountryProbabilityPct !== undefined
      ? result.cityInCountryProbabilityPct
      : Math.min(100, Math.max(0.001, Number(((cityPop / countryPop) * 100).toFixed(3))));

  const globalCityProb =
    result.globalCityProbabilityPct !== undefined
      ? result.globalCityProbabilityPct
      : Number(((countryProb * cityInCountryProb) / 100).toFixed(5));

  const tierInfo = TIER_BADGES[country.tier] || {
    label: `🎲 ${country.tier}`,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    glow: '',
  };

  const handleCopyResult = () => {
    let cityBadgeStr = '';
    if (isCap && isLargest) cityBadgeStr = ' (수도 및 최대도시)';
    else if (isCap) cityBadgeStr = ' (수도)';
    else if (isLargest) cityBadgeStr = ' (최대도시)';

    const text = `🌏 [환생 결과] ${country.country_ko} (${city.name}${cityBadgeStr})\n- 난이도: ${country.tier}\n- 국가 당첨 확률: ${countryProb}%\n- 지역(도시) 국가 내 비중: ${cityInCountryProb}%\n- 전 세계 최종 당첨 확률: ${globalCityProb}%\n- 선평: ${country.pro}\n- 악평: ${country.con}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-md mb-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Typing Effect & Tier Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
              Soul Rebirth Certificate
            </span>
            {isCap && isLargest ? (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 border border-amber-400/40 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>수도 & 최대도시 직할</span>
              </span>
            ) : isCap ? (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 border border-amber-400/40 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-amber-600" />
                <span>국가 수도(Capital)</span>
              </span>
            ) : isLargest ? (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>국가 제1의 최대도시</span>
              </span>
            ) : null}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            <span>{typedTitle}</span>
            {!isTypingDone && (
              <span className="inline-block w-2.5 h-5 bg-indigo-600 ml-1 animate-pulse" />
            )}
          </h2>
        </div>

        {/* Tier & Share button */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black border shadow-sm ${tierInfo.bg} ${tierInfo.text} ${tierInfo.border} ${tierInfo.glow}`}
          >
            {tierInfo.label}
          </span>
          <button
            type="button"
            onClick={handleCopyResult}
            title="결과 복사"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Probability Showcase Card */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 rounded-2xl p-4 border border-indigo-100 mb-5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 mb-2.5 pb-1.5 border-b border-indigo-200/50">
          <Percent className="w-4 h-4 text-indigo-600" />
          <span>당첨 확률 분석 ({mode === 'birth' ? '출생아 수 기준' : '인구 분포 기준'})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Country Winning Probability */}
          <div className="bg-white/90 rounded-xl p-3 border border-indigo-100/80 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500">🌍 국가 당첨 확률</div>
            <div className="text-base sm:text-lg font-black text-indigo-700 mt-0.5">
              {countryProb}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {formatOdds(countryProb)}
            </div>
          </div>

          {/* City within country Probability */}
          <div className="bg-white/90 rounded-xl p-3 border border-purple-100/80 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500">🏙️ 지역({city.name}) 국가 내 비중</div>
            <div className="text-base sm:text-lg font-black text-purple-700 mt-0.5">
              {cityInCountryProb}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {country.country_ko} 내 인구 가중치
            </div>
          </div>

          {/* Combined Global Winning Probability */}
          <div className="bg-white/90 rounded-xl p-3 border border-pink-100/80 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500">🌐 전 세계 최종 당첨 확률</div>
            <div className="text-base sm:text-lg font-black text-pink-700 mt-0.5">
              {globalCityProb}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {formatOdds(globalCityProb)}
            </div>
          </div>
        </div>
      </div>

      {/* Soul Reviews: Divided into Light (선평) & Shadow (악평) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* National Review */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <span className="text-indigo-600">🌍</span>
            <span>국가 영혼의 한 줄 평 [{country.country_ko}]</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
              <span className="text-emerald-700 font-extrabold shrink-0 text-xs mt-0.5">
                [선평]
              </span>
              <p className="text-emerald-950 font-medium leading-relaxed">
                {country.pro}
              </p>
            </div>
            <div className="flex items-start gap-2 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200/60">
              <span className="text-rose-700 font-extrabold shrink-0 text-xs mt-0.5">
                [악평]
              </span>
              <p className="text-rose-950 font-medium leading-relaxed">
                {country.con}
              </p>
            </div>
          </div>
        </div>

        {/* Regional Review */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <span className="text-indigo-600">🏙️</span>
            <span>세부 지역 한 줄 평 [{city.name}]</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/60">
              <span className="text-teal-700 font-extrabold shrink-0 text-xs mt-0.5">
                [선평]
              </span>
              <p className="text-teal-950 font-medium leading-relaxed">
                {city.pro}
              </p>
            </div>
            <div className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
              <span className="text-amber-800 font-extrabold shrink-0 text-xs mt-0.5">
                [악평]
              </span>
              <p className="text-amber-950 font-medium leading-relaxed">
                {city.con}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">치안 / 살인율</div>
            <div className="font-bold text-slate-900">
              10만 명당 <strong>{country.homicide}명</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">소득불평등 (지니계수)</div>
            <div className="font-bold text-slate-900">
              {country.gini}/100{' '}
              {country.gdp_capita && (
                <span className="text-xs text-slate-500 font-normal">
                  (${country.gdp_capita.toLocaleString()})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">국가 총인구 & 도시인구</div>
            <div className="font-bold text-slate-900">
              {formatKoreanNumber(country.population)}{' '}
              <span className="text-xs text-slate-500 font-normal">
                (도시 {city.population.toLocaleString()}명)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">
              {mode === 'birth' ? '연간 출생아 수' : '인구 점유율'}
            </div>
            <div className="font-bold text-slate-900">
              {formatKoreanNumber(mode === 'birth' ? country.births : country.population)}{' '}
              <span className="text-xs text-slate-500 font-normal">
                (세계의 {country.birth_share_pct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Distinctive City Designation Cards */}
        {isCap && isLargest ? (
          <div className="sm:col-span-2 flex items-center gap-2.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-3 rounded-xl border border-amber-300/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-amber-800 font-black text-xs flex items-center gap-1">
                <span>👑🏛️ 국가 수도 및 최대 메가시티 (Capital & Largest City)</span>
              </div>
              <div className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                {city.name} (국가의 모든 정치·경제·문화가 완벽히 집결된 최고 중심지)
              </div>
            </div>
          </div>
        ) : isCap ? (
          <div className="sm:col-span-2 flex items-center gap-2.5 bg-amber-500/10 p-3 rounded-xl border border-amber-300/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-amber-800 font-black text-xs flex items-center gap-1">
                <span>🏛️ 국가 수도 직할지 (National Capital)</span>
              </div>
              <div className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                {city.name} (국가의 모든 정치·행정·외교의 심장부인 공식 수도)
              </div>
            </div>
          </div>
        ) : isLargest ? (
          <div className="sm:col-span-2 flex items-center gap-2.5 bg-emerald-500/10 p-3 rounded-xl border border-emerald-300/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-emerald-800 font-black text-xs flex items-center gap-1">
                <span>🌟 국가 제1의 최대 경제도시 (Largest Metropolis)</span>
              </div>
              <div className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                {city.name} (국가 최대 규모의 인구와 경제력을 지닌 제1의 메트로폴리스)
              </div>
            </div>
          </div>
        ) : isAlreadyMajor ? (
          <div className="sm:col-span-2 flex items-center gap-2.5 bg-slate-100 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-indigo-700 font-black text-xs flex items-center gap-1">
                <span>🏙️ 권역 핵심 대도시 (Major City)</span>
              </div>
              <div className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                {city.name} (해당 권역을 대표하는 주요 거점 대도시)
              </div>
            </div>
          </div>
        ) : city.nearest_major_city ? (
          <div className="sm:col-span-2 flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-slate-400 text-[11px]">가장 가까운 알 만한 대도시</div>
              <div className="font-bold text-slate-900 truncate">
                {city.nearest_major_city.name}
                {calculatedDistanceKm !== null && (
                  <span className="text-xs text-indigo-600 font-semibold ml-2">
                    약 {calculatedDistanceKm.toLocaleString()} km 직선거리
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
