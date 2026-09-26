import React from 'react';
import { Sparkles, Dices, RefreshCw } from 'lucide-react';

interface ReincarnateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const ReincarnateButton: React.FC<ReincarnateButtonProps> = ({
  onClick,
  isLoading,
}) => {
  return (
    <div className="w-full mb-6">
      <button
        type="button"
        disabled={isLoading}
        onClick={onClick}
        className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 active:scale-[0.99] text-white font-black text-lg sm:text-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed group border border-white/20"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="tracking-wide">운명의 궤도 탐색 중...</span>
          </>
        ) : (
          <>
            <Dices className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
            <span className="tracking-wide">🎲 새로운 운명으로 다시 태어나기</span>
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse hidden sm:inline-block" />
          </>
        )}
      </button>
    </div>
  );
};
