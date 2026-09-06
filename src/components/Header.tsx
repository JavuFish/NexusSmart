import React, { useState } from 'react';
import {
  Palette,
  Volume2,
  VolumeX,
  History,
  Info,
  Sparkles,
  Calculator,
  Binary,
  ArrowLeftRight,
  Landmark,
  BrainCircuit,
  X,
  Smartphone,
  Zap,
} from 'lucide-react';
import { CalculatorMode, ThemeConfig } from '../types';
import { playFuturisticSound } from '../utils/audio';
import { AppLogoIcon } from './AppLogoIcon';

interface HeaderProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  theme: ThemeConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenThemeSelector: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  theme,
  soundEnabled,
  onToggleSound,
  onOpenThemeSelector,
  onOpenHistory,
  historyCount,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const modes: { id: CalculatorMode; name: string; shortName: string; icon: React.ReactNode }[] = [
    { id: 'scientific', name: 'Ilmiah & Standar', shortName: 'Ilmiah', icon: <Calculator className="w-3.5 h-3.5" /> },
    { id: 'programmer', name: 'Programmer Hex/Bin', shortName: 'Programmer', icon: <Binary className="w-3.5 h-3.5" /> },
    { id: 'converter', name: 'Konverter Satuan', shortName: 'Konverter', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { id: 'finance', name: 'Finansial & KPR', shortName: 'Finansial', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'solver', name: 'Smart Solver & Grafik', shortName: 'Solver', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full flex flex-col gap-2.5 pb-2">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-1.5 px-0.5 sm:px-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <AppLogoIcon size={34} glow={!theme.isLight} className="rounded-xl shadow-sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className={`font-extrabold text-xs sm:text-sm tracking-tight flex items-center gap-0.5 font-mono truncate ${theme.textTitle}`}>
                NEXUS<span className={theme.textPrimary}>SMART</span>
              </span>
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold shrink-0 ${
                theme.isLight ? 'bg-slate-200/80 text-slate-700' : 'bg-white/10 text-slate-300'
              }`}>
                PRO
              </span>
            </div>
            <p className={`text-[9px] sm:text-[10px] font-medium truncate ${theme.textSub}`}>Smart Calculator</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sound toggle */}
          <button
            id="toggle-sound-btn"
            onClick={() => {
              playFuturisticSound('switch', !soundEnabled);
              onToggleSound();
            }}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              soundEnabled
                ? theme.isLight
                  ? 'bg-sky-100/90 text-sky-700 border-sky-300 shadow-xs'
                  : 'bg-slate-900/90 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : theme.isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* History drawer button */}
          <button
            id="open-history-btn"
            onClick={() => {
              playFuturisticSound('action', soundEnabled);
              onOpenHistory();
            }}
            className={`relative p-1.5 sm:p-2 rounded-xl border transition-all ${
              theme.isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title="Riwayat Perhitungan"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-pink-500 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center shadow-md">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Theme selector trigger */}
          <button
            id="open-theme-btn"
            onClick={() => {
              playFuturisticSound('action', soundEnabled);
              onOpenThemeSelector();
            }}
            className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs ${
              theme.isLight
                ? 'bg-sky-50 hover:bg-sky-100/80 border-sky-200 text-sky-800'
                : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/40 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
            }`}
            title="Ganti Tema Tampilan (10 Pilihan)"
          >
            <Palette className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline-block text-[11px] font-semibold">{theme.name.split(' ')[0]}</span>
            <span className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono ${theme.pillTagBg}`}>
              {theme.category === 'soft' ? 'SOFT' : 'PRO'}
            </span>
          </button>

          {/* Info guide modal trigger */}
          <button
            id="open-info-btn"
            onClick={() => {
              playFuturisticSound('action', soundEnabled);
              setShowInfoModal(true);
            }}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              theme.isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-600'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Informasi Aplikasi & Fitur"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Mode navigation bar (Scrollable pills) */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 min-w-max px-0.5">
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`mode-tab-${m.id}`}
                onClick={() => {
                  playFuturisticSound('switch', soundEnabled);
                  onSelectMode(m.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                  isActive
                    ? `${theme.activeTab} ring-1 ring-sky-500/60 dark:ring-cyan-400/60 scale-[1.02]`
                    : theme.inactiveTab
                }`}
              >
                <span className={isActive ? theme.textPrimary : theme.isLight ? 'text-slate-500' : 'text-slate-400'}>{m.icon}</span>
                <span>{m.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info & Feature Guide Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-5 sm:p-6 rounded-2xl border shadow-2xl ${theme.cardBg} ${theme.cardBorder}`}>
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${theme.isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2.5">
                <AppLogoIcon size={38} glow={!theme.isLight} className="rounded-xl shadow-sm" />
                <div>
                  <h4 className={`font-bold text-base ${theme.textTitle}`}>Smart Calculator Android Flagship</h4>
                  <p className={`text-xs ${theme.textSub}`}>Arsitektur & Fitur Terlengkap Play Store Edition</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme.isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className={`font-semibold flex items-center gap-1.5 mb-1 ${theme.isLight ? 'text-sky-700' : 'text-cyan-400'}`}>
                  <Sparkles className="w-3.5 h-3.5" /> 10 Pilihan Tema Estetik & Futuristik
                </div>
                <p className={`leading-relaxed ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  5 Tema Modern & Soft (Nordic Minimalist, Matcha Latte, Soft Lavender, Warm Oat, Sky Breeze) serta 5 Tema Futuristik (Cyberpunk Neon, Matrix Quantum, Solar Flare, Hyper Frost, Deep Nebula).
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className={`font-semibold flex items-center gap-1.5 mb-1 ${theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  <Calculator className="w-3.5 h-3.5" /> Mode Ilmiah & Memori
                </div>
                <p className={`leading-relaxed ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Trigonometri lengkap (Sin, Cos, Tan, Asin, Acos, Atan), Deg/Rad toggle, Logaritma (log, ln), Eksponen, Pangkat, Akar kuadrat/kubik, Faktorial, Phi, Euler, dan Register Memori (MC, MR, M+, M-, MS).
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className={`font-semibold flex items-center gap-1.5 mb-1 ${theme.isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                  <Binary className="w-3.5 h-3.5" /> Mode Programmer & 64-Bit Interactive Bitboard
                </div>
                <p className={`leading-relaxed ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Konversi instan HEX, DEC, OCT, BIN, ukuran QWORD (64-bit), DWORD (32-bit), WORD, BYTE, operasi logika AND, OR, XOR, NOT, Shift LSH/RSH, dan papan bitboard interaktif yang bisa diklik tiap bitnya.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className={`font-semibold flex items-center gap-1.5 mb-1 ${theme.isLight ? 'text-blue-700' : 'text-sky-400'}`}>
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Konverter Satuan All-In-One
                </div>
                <p className={`leading-relaxed ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  9 kategori lengkap: Panjang, Berat/Massa, Suhu (°C, °F, K, °R), Kecepatan, Luas, Volume, Data Digital (Bytes, MB, GB, TB), Waktu, dan Tekanan.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className={`font-semibold flex items-center gap-1.5 mb-1 ${theme.isLight ? 'text-rose-700' : 'text-pink-400'}`}>
                  <Landmark className="w-3.5 h-3.5" /> Finansial, KPR & Split Bill
                </div>
                <p className={`leading-relaxed ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Kalkulator cicilan pinjaman/KPR dengan tabel amortisasi, bunga majemuk investasi (compound interest), diskon & PPN/pajak, serta bagi tagihan restoran (split bill & tips).
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className={`font-semibold flex items-center gap-1.5 mb-1 ${theme.isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                  <BrainCircuit className="w-3.5 h-3.5" /> Smart Solver & Plotter Grafik 2D
                </div>
                <p className={`leading-relaxed ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Plotter fungsi matematika interaktif f(x) dengan kanvas visual, pemecah persamaan kuadrat langkah-demi-langkah, SPLDV 2 variabel, kalkulator BMI & kalori BMR, serta hitung usia & tanggal presisi.
                </p>
              </div>
            </div>

            <div className={`mt-4 pt-3 border-t flex justify-end ${theme.isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setShowInfoModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${theme.accentPrimary}`}
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
