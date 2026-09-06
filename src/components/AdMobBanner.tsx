import React, { useState } from 'react';
import { ExternalLink, Info, Sparkles, X } from 'lucide-react';
import { ThemeConfig } from '../types';

interface AdMobBannerProps {
  theme: ThemeConfig;
  adUnitId?: string;
  position?: 'bottom' | 'top';
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  theme,
  adUnitId = 'ca-app-pub-3940256099942544/6300978111', // Official Google AdMob Test Banner Unit ID
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showAdInfo, setShowAdInfo] = useState<boolean>(false);

  if (isDismissed) {
    return (
      <div className="w-full flex justify-center py-1">
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-mono transition-colors"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Tampilkan Banner AdMob</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center mt-3 pt-2 border-t ${theme.isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
      {/* Container Banner AdMob standard 320x50 / Adaptive Banner */}
      <div
        className={`w-full max-w-[360px] h-[52px] rounded-xl relative overflow-hidden flex items-center justify-between px-3 border transition-all duration-300 ${theme.displayBg} shadow-inner`}
      >
        {/* AdMob Official Badge & Information */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col items-center justify-center">
            <span className={`px-1 py-0.2 rounded font-mono text-[8px] font-bold tracking-wider uppercase ${
              theme.isLight
                ? 'bg-amber-100 border border-amber-300 text-amber-800'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
            }`}>
              AD
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold truncate flex items-center gap-1 ${
                theme.isLight ? 'text-slate-800' : 'text-slate-100'
              }`}>
                Nexus Cloud Platform <ExternalLink className="w-2.5 h-2.5 text-cyan-500 opacity-80 inline" />
              </span>
            </div>
            <p className={`text-[10px] truncate ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Komputasi kuantum & engine analitik pintar generasi baru.
            </p>
          </div>
        </div>

        {/* Action button / AdMob Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setShowAdInfo((prev) => !prev)}
            className={`p-1 rounded-md transition-colors ${
              theme.isLight
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
            }`}
            title="Info Google AdMob Banner"
          >
            <Info className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className={`p-1 rounded-md transition-colors ${
              theme.isLight
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
            }`}
            title="Sembunyikan Sementara"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expandable AdMob Unit Info */}
      {showAdInfo && (
        <div className={`w-full max-w-[360px] mt-1.5 p-2 rounded-lg border text-[10px] font-mono space-y-1 ${
          theme.isLight ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <div className={`flex items-center justify-between ${theme.isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}`}>
            <span className={`font-bold ${theme.isLight ? 'text-sky-700' : 'text-cyan-400'}`}>Google AdMob Banner Slot</span>
            <span className={theme.isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}>STATUS: ACTIVE</span>
          </div>
          <div className={`text-[9px] break-all ${theme.isLight ? 'text-slate-600' : 'text-slate-500'}`}>
            Package: <strong className={theme.isLight ? 'text-slate-900' : 'text-slate-300'}>com.asastudio</strong>
          </div>
          <div className={`text-[9px] break-all ${theme.isLight ? 'text-slate-600' : 'text-slate-500'}`}>
            AdUnitId: <strong className={theme.isLight ? 'text-slate-900' : 'text-slate-300'}>{adUnitId}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
