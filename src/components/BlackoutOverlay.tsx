import React, { useEffect, useState } from 'react';

interface BlackoutOverlayProps {
  isVisible: boolean;
  onAnimationEnd: () => void;
}

export const BlackoutOverlay: React.FC<BlackoutOverlayProps> = ({
  isVisible,
  onAnimationEnd,
}) => {
  const [phase, setPhase] = useState<'idle' | 'darkening' | 'soul_transition' | 'fading_out'>('idle');

  useEffect(() => {
    if (!isVisible) {
      setPhase('idle');
      return;
    }

    // Step 1: Rapid screen blackout
    setPhase('darkening');

    // Step 2: Soul transition mystical aura
    const t1 = setTimeout(() => {
      setPhase('soul_transition');
    }, 400);

    // Step 3: Fade out blackout overlay
    const t2 = setTimeout(() => {
      setPhase('fading_out');
    }, 1300);

    // Step 4: Complete transition and invoke callback
    const t3 = setTimeout(() => {
      setPhase('idle');
      onAnimationEnd();
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isVisible, onAnimationEnd]);

  if (phase === 'idle') {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        phase === 'fading_out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Mystical glowing vortex */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/40 to-amber-400/30 blur-2xl animate-pulse" />
        <div className="relative text-5xl sm:text-6xl animate-bounce">
          ✨
        </div>
      </div>

      <div className="mt-8 text-center px-6">
        <p className="text-white text-lg sm:text-2xl font-black tracking-widest animate-pulse">
          영혼이 윤회의 궤도를 따라 이동 중입니다...
        </p>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 font-mono">
          [새로운 국적과 도시의 좌표를 탐색 중]
        </p>
      </div>
    </div>
  );
};
