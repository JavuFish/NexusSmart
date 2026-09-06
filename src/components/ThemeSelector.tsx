import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, Sparkles, X, Type, Feather } from 'lucide-react';
import { ThemeConfig, ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { playFuturisticSound } from '../utils/audio';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  soundEnabled: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundEnabled,
}) => {
  const [activeCategory, setActiveCategory] = useState<'soft' | 'futuristic' | 'all'>('soft');
  const themeList = Object.values(THEMES);
  const activeThemeConfig: ThemeConfig = THEMES[currentTheme] || THEMES.nordic;

  const filteredThemes = themeList.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className={`relative w-full max-w-lg p-5 sm:p-6 rounded-3xl border shadow-2xl z-10 flex flex-col max-h-[90vh] ${
              activeThemeConfig.isLight
                ? 'bg-white/95 text-slate-900 border-slate-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
                : `${activeThemeConfig.cardBg} ${activeThemeConfig.cardBorder}`
            }`}
            id="theme-selector-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-2xl ${
                    activeThemeConfig.isLight
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 ${
                      activeThemeConfig.isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Katalog Tema Tampilan
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/40 font-semibold">
                      10 PILIHAN
                    </span>
                  </h3>
                  <p
                    className={`text-xs ${
                      activeThemeConfig.isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Pilih estetika modern, warna soft & gaya font unik kalkulator
                  </p>
                </div>
              </div>

              <button
                id="close-theme-modal-btn"
                onClick={() => {
                  playFuturisticSound('action', soundEnabled);
                  onClose();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 mb-3 text-xs">
              <button
                onClick={() => {
                  playFuturisticSound('switch', soundEnabled);
                  setActiveCategory('soft');
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'soft'
                    ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>Soft & Clean (5 Baru)</span>
              </button>

              <button
                onClick={() => {
                  playFuturisticSound('switch', soundEnabled);
                  setActiveCategory('futuristic');
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'futuristic'
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Futuristik & Cyber (5)</span>
              </button>

              <button
                onClick={() => {
                  playFuturisticSound('switch', soundEnabled);
                  setActiveCategory('all');
                }}
                className={`py-1.5 px-3 rounded-xl font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua
              </button>
            </div>

            {/* Theme options scrollable grid */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 no-scrollbar">
              {filteredThemes.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    onClick={() => {
                      playFuturisticSound('sparkle', soundEnabled);
                      onSelectTheme(theme.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col gap-2 ${
                      isSelected
                        ? `${theme.activeTab} ring-2 ring-sky-500/70 dark:ring-cyan-400/80 shadow-md`
                        : theme.isLight
                        ? 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    {/* Top Row: Color Swatches + Name + Badge + Check */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* 3 Swatch Dots */}
                        <div className="flex items-center -space-x-1.5 p-1 rounded-lg bg-white/60 dark:bg-black/50 border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
                          {theme.previewColors.map((col, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: col }}
                              className="w-4 h-4 rounded-full border border-white/40 dark:border-black/40 shadow-xs"
                            />
                          ))}
                        </div>

                        {/* Name & Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-bold text-sm tracking-tight ${
                              theme.isLight ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {theme.name}
                          </span>
                          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md font-semibold ${theme.pillTagBg}`}>
                            {theme.badge}
                          </span>
                          {theme.category === 'soft' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              SOFT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active indicator */}
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-sky-700 dark:text-cyan-300 font-bold text-xs px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-500/50 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>Dipakai</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
                          Pilih
                        </span>
                      )}
                    </div>

                    {/* Subtitle Description */}
                    <p
                      className={`text-xs ${
                        theme.isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {theme.subtitle}
                    </p>

                    {/* Bottom Row: Typography details + Live Preview */}
                    <div
                      className={`flex items-center justify-between pt-2 border-t text-[11px] ${
                        theme.isLight ? 'border-slate-200/80' : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Type className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{theme.fontName}</span>
                        <span className="hidden sm:inline text-[10px] text-slate-400">({theme.fontDesc})</span>
                      </div>

                      {/* Live sample rendered in that font */}
                      <div className={`px-2 py-0.5 rounded font-bold ${theme.fontFamily} tracking-wide ${theme.textPrimary}`}>
                        123 + 456 = 579
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
                Tema tersimpan otomatis di perangkat Anda
              </span>
              <button
                id="finish-theme-modal-btn"
                onClick={() => {
                  playFuturisticSound('action', soundEnabled);
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeThemeConfig.btnEqual}`}
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
