import React from 'react';
import { Database, ExternalLink, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 pt-8 pb-14 border-t border-slate-200/90 text-xs text-slate-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>공식 데이터 출처 (Data Sources & Attribution)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <a
          href="https://data.un.org/Data.aspx?d=POP&f=tableCode%3A55"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 transition group"
        >
          <div>
            <div className="font-extrabold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
              <span>UNdata Live births by month of birth</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              UN 통계국 국가별 연간/월별 출생아 수 통계 (Table Code 55)
            </div>
          </div>
        </a>

        <a
          href="https://simplemaps.com/data/world-cities"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 transition group"
        >
          <div>
            <div className="font-extrabold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
              <span>Simplemaps World Cities Database</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              전 세계 50,000+개 도시 및 행정구역, 좌표, 인구 데이터
            </div>
          </div>
        </a>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          본 시뮬레이터는 UN의 최신 출생아 수 통계와 Simplemaps의 전 세계 도시 인구 가중치 알고리즘을 기반으로 무작위 추첨됩니다. 지도 데이터는 OpenStreetMap 기여자에 의해 제공됩니다.
        </span>
      </div>
    </footer>
  );
};
