import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, Copy, Check, X, ArrowUpRight, Download } from 'lucide-react';
import { CalculationHistoryItem, ThemeConfig } from '../types';
import { playFuturisticSound } from '../utils/audio';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
  theme: ThemeConfig;
  soundEnabled: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
  theme,
  soundEnabled,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playFuturisticSound('action', soundEnabled);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const content = history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleString('id-ID')}] (${h.mode.toUpperCase()})\nPerhitungan: ${h.expression} = ${h.result}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat_kalkulator_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    playFuturisticSound('action', soundEnabled);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`relative w-full max-w-md h-full max-h-screen p-5 border-l shadow-2xl flex flex-col z-10 ${theme.cardBg} ${theme.cardBorder}`}
            id="history-drawer-panel"
          >
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${theme.isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${
                  theme.isLight ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}>
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base flex items-center gap-2 ${theme.textTitle}`}>
                    Riwayat Perhitungan
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      theme.isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {history.length}
                    </span>
                  </h3>
                  <p className={`text-xs ${theme.textSub}`}>Tape memori perhitungan tersimpan</p>
                </div>
              </div>

              <button
                onClick={() => {
                  playFuturisticSound('action', soundEnabled);
                  onClose();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme.isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {history.length > 0 && (
              <div className="flex items-center justify-between mb-3 gap-2">
                <button
                  onClick={handleExport}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    theme.isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 font-medium'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="Ekspor Riwayat sebagai File Teks"
                >
                  <Download className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
                  <span>Ekspor Teks</span>
                </button>

                <button
                  onClick={() => {
                    playFuturisticSound('delete', soundEnabled);
                    onClearHistory();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    theme.isLight
                      ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 font-medium'
                      : 'bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              </div>
            )}

            {/* History Items list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div className={`p-3 rounded-full border mb-2 ${
                    theme.isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    <History className="w-8 h-8" />
                  </div>
                  <p className={`font-medium text-sm ${theme.isLight ? 'text-slate-700' : 'text-slate-400'}`}>Belum ada riwayat perhitungan</p>
                  <p className={`text-xs mt-1 max-w-[200px] ${theme.isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    Lakukan perhitungan di kalkulator untuk melihat rekaman di sini.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all group relative ${
                      theme.isLight
                        ? 'bg-slate-50/90 border-slate-200 hover:border-sky-400 shadow-xs'
                        : 'bg-slate-900/70 border-slate-800/90 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`uppercase font-mono px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        theme.isLight ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-800 text-cyan-400'
                      }`}>
                        {item.mode}
                      </span>
                      <span className={theme.isLight ? 'text-slate-500' : 'text-slate-400'}>
                        {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className={`font-mono text-xs break-all mb-1 ${
                      theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
                    }`}>
                      {item.expression} =
                    </div>

                    <div className={`font-mono text-base font-bold tracking-wide break-all ${theme.textPrimary}`}>
                      {item.result}
                    </div>

                    {/* Action buttons */}
                    <div className={`mt-2 pt-2 border-t flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 ${
                      theme.isLight ? 'border-slate-200' : 'border-slate-800/80'
                    }`}>
                      <button
                        onClick={() => handleCopy(item.id, item.result)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors ${
                          theme.isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                            : 'bg-slate-800 hover:bg-slate-700 border-transparent text-slate-300 hover:text-white'
                        }`}
                        title="Salin Hasil"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          playFuturisticSound('sparkle', soundEnabled);
                          onSelectHistoryItem(item);
                          onClose();
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors ${
                          theme.isLight
                            ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 font-semibold'
                            : 'bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/40 text-cyan-300'
                        }`}
                        title="Pakai Nilai ini di Kalkulator"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Gunakan</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
