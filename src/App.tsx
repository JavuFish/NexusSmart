import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalculationHistoryItem, CalculatorMode, ThemeId } from './types';
import { THEMES } from './utils/themes';
import { Header } from './components/Header';
import { ThemeSelector } from './components/ThemeSelector';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ScientificMode } from './components/ScientificMode';
import { ProgrammerMode } from './components/ProgrammerMode';
import { UnitConverterMode } from './components/UnitConverterMode';
import { FinanceMode } from './components/FinanceMode';
import { SmartSolverMode } from './components/SmartSolverMode';

export default function App() {
  // Theme state with local persistence
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_calc_theme');
      if (saved && saved in THEMES) return saved as ThemeId;
    }
    return 'cyberpunk';
  });

  // Current calculation mode
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('scientific');

  // Sound FX toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_calc_sound');
      return saved !== 'false';
    }
    return true;
  });

  // History state
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smart_calc_history');
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore parse error
      }
    }
    return [];
  });

  // Modals / Drawers
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('smart_calc_theme', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('smart_calc_sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('smart_calc_history', JSON.stringify(history));
  }, [history]);

  const activeTheme = THEMES[themeId] || THEMES.cyberpunk;

  // Add item to history tape
  const handleAddHistory = (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // Keep last 50
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 md:p-6 transition-colors duration-300 ${activeTheme.bgMain}`}
    >
      <main
        id="calculator-app"
        className={`w-full max-w-lg transition-all duration-300 flex flex-col p-3 sm:p-4 md:p-5 rounded-2xl md:rounded-3xl ${activeTheme.cardBg} border ${activeTheme.cardBorder} shadow-2xl relative my-auto`}
      >
        {/* Navigation & Actions Header */}
        <Header
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          theme={activeTheme}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
          onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          historyCount={history.length}
        />

        {/* Dynamic Mode Content with Smooth Animations */}
        <div className="flex-1 w-full mt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              {currentMode === 'scientific' && (
                <ScientificMode
                  theme={activeTheme}
                  soundEnabled={soundEnabled}
                  onAddHistory={handleAddHistory}
                />
              )}

              {currentMode === 'programmer' && (
                <ProgrammerMode
                  theme={activeTheme}
                  soundEnabled={soundEnabled}
                  onAddHistory={handleAddHistory}
                />
              )}

              {currentMode === 'converter' && (
                <UnitConverterMode
                  theme={activeTheme}
                  soundEnabled={soundEnabled}
                  onAddHistory={handleAddHistory}
                />
              )}

              {currentMode === 'finance' && (
                <FinanceMode
                  theme={activeTheme}
                  soundEnabled={soundEnabled}
                  onAddHistory={handleAddHistory}
                />
              )}

              {currentMode === 'solver' && (
                <SmartSolverMode
                  theme={activeTheme}
                  soundEnabled={soundEnabled}
                  onAddHistory={handleAddHistory}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Theme Selector Modal */}
        <ThemeSelector
          isOpen={isThemeSelectorOpen}
          onClose={() => setIsThemeSelectorOpen(false)}
          currentTheme={themeId}
          onSelectTheme={(newTheme) => {
            setThemeId(newTheme);
            setIsThemeSelectorOpen(false);
          }}
          soundEnabled={soundEnabled}
        />

        {/* History Tape Drawer */}
        <HistoryDrawer
          isOpen={isHistoryDrawerOpen}
          onClose={() => setIsHistoryDrawerOpen(false)}
          history={history}
          onClearHistory={handleClearHistory}
          onSelectHistoryItem={(_item) => {
            setCurrentMode('scientific');
          }}
          theme={activeTheme}
          soundEnabled={soundEnabled}
        />
      </main>
    </div>
  );
}
