import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { ReincarnationMap } from './components/ReincarnationMap';
import { ReincarnationResult } from './components/ReincarnationResult';
import { ReincarnateButton } from './components/ReincarnateButton';
import { BlackoutOverlay } from './components/BlackoutOverlay';
import { HistoryDashboard } from './components/HistoryDashboard';
import { Footer } from './components/Footer';
import { ReincarnationResultData } from './types';
import { clearHistory, getHistory, saveHistory } from './utils/storage';
import {
  loadCountriesData,
  performReincarnation,
} from './utils/reincarnationEngine';

export const App: React.FC = () => {
  const [mode, setMode] = useState<'birth' | 'population'>('birth');
  const [totalWorldBirths, setTotalWorldBirths] = useState<number>(132000000);
  const [totalWorldPopulation, setTotalWorldPopulation] = useState<number>(8000000000);
  const [currentResult, setCurrentResult] = useState<ReincarnationResultData | null>(null);
  const [pendingResult, setPendingResult] = useState<ReincarnationResultData | null>(null);
  const [history, setHistory] = useState<ReincarnationResultData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBlackout, setShowBlackout] = useState<boolean>(false);

  // Initialize data and history
  useEffect(() => {
    // Load history
    const storedHistory = getHistory();
    setHistory(storedHistory);
    if (storedHistory.length > 0) {
      setCurrentResult(storedHistory[0]);
    }

    // Load initial country totals
    loadCountriesData()
      .then((data) => {
        if (data.metadata) {
          setTotalWorldBirths(data.metadata.total_world_births);
          setTotalWorldPopulation(data.metadata.total_world_population);
        }
      })
      .catch((err) => {
        console.error('Failed to load initial country data:', err);
      });
  }, []);

  const handleReincarnate = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const nextResult = await performReincarnation(mode);
      setPendingResult(nextResult);
      // Trigger dramatic blackout animation
      setShowBlackout(true);
    } catch (error) {
      console.error('Reincarnation error:', error);
      alert('환생 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsLoading(false);
    }
  };

  const handleBlackoutEnd = () => {
    if (pendingResult) {
      setCurrentResult(pendingResult);
      const updatedHistory = saveHistory(pendingResult);
      setHistory(updatedHistory);

      // Trigger celebratory confetti for top tier country
      if (pendingResult.country.tier === '천국') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
    setShowBlackout(false);
    setIsLoading(false);
  };

  const handleReset = () => {
    clearHistory();
    setHistory([]);
    setCurrentResult(null);
  };

  const handleSelectHistoryItem = (item: ReincarnationResultData) => {
    setCurrentResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 py-6 sm:py-10 px-3 sm:px-6 md:px-8">
      {/* Blackout Dramatic Overlay */}
      <BlackoutOverlay
        isVisible={showBlackout}
        onAnimationEnd={handleBlackoutEnd}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto bg-[#fafafa] rounded-[2rem] p-4 sm:p-7 md:p-9 shadow-lg border border-gray-200/80">
        {/* Header Section */}
        <Header mode={mode} onModeChange={setMode} />

        {/* 4 Stat Cards */}
        <StatCards
          totalWorldBirths={totalWorldBirths}
          totalWorldPopulation={totalWorldPopulation}
          currentResult={currentResult}
          reincarnationCount={history.length}
          mode={mode}
        />

        {/* Leaflet OpenStreetMap View */}
        <ReincarnationMap currentResult={currentResult} />

        {/* Reincarnation Result Box with Typewriter Effect */}
        <ReincarnationResult result={currentResult} mode={mode} />

        {/* Big Reincarnate Action Button */}
        <ReincarnateButton
          onClick={handleReincarnate}
          isLoading={isLoading}
        />

        {/* History and Cumulative Dashboard */}
        <HistoryDashboard
          history={history}
          onReset={handleReset}
          onSelectHistoryItem={handleSelectHistoryItem}
        />

        {/* Footer with UN citation and Creator Links */}
        <Footer />
      </main>
    </div>
  );
};

export default App;
