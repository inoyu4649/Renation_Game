import React from 'react';
import { Globe2, Sparkles, Users } from 'lucide-react';

interface HeaderProps {
  mode: 'birth' | 'population';
  onModeChange: (mode: 'birth' | 'population') => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange }) => {
  return (
    <header className="w-full mb-8">
      {/* Top Bar with Badge & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Globe2 className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                Global Reincarnation Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              전생의 문 : <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">환생 시뮬레이터</span>
            </h1>
          </div>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onModeChange('birth')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'birth'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>연간 출생아 확률</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('population')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'population'
                ? 'bg-white text-purple-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>총 인구 확률</span>
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 mt-3 font-medium flex items-center gap-1.5">
        <span>💫</span>
        <span>
          {mode === 'birth'
            ? 'UN 공식 출생 통계를 바탕으로, 오늘날 지구상에 태어나는 신생아의 확률로 당신의 새로운 국적과 도시를 추첨합니다.'
            : '전 세계 총 인구 분포를 기준으로 전 세계 5만 개 도시 중 한 곳으로 환생합니다.'}
        </span>
      </p>
    </header>
  );
};
