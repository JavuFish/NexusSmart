import React, { useState, useMemo } from 'react';
import {
  Ruler,
  Scale,
  Thermometer,
  HardDrive,
  Gauge,
  Grid,
  Box,
  Clock,
  Activity,
  ArrowUpDown,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CalculationHistoryItem, ThemeConfig } from '../types';
import { UNIT_CATEGORIES, convertUnit } from '../utils/converters';
import { playFuturisticSound } from '../utils/audio';

interface UnitConverterModeProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
  onAddHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const UnitConverterMode: React.FC<UnitConverterModeProps> = ({
  theme,
  soundEnabled,
  onAddHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('length');
  const [fromValue, setFromValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('km');
  const [toUnitId, setToUnitId] = useState<string>('m');
  const [copied, setCopied] = useState<boolean>(false);

  const category = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.id === selectedCategory) || UNIT_CATEGORIES[0];
  }, [selectedCategory]);

  // Handle category switch
  const handleSelectCategory = (catId: string) => {
    playFuturisticSound('switch', soundEnabled);
    setSelectedCategory(catId);
    const cat = UNIT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.units.length >= 2) {
      setFromUnitId(cat.units[0].id);
      setToUnitId(cat.units[1].id);
    }
  };

  // Converted result
  const convertedResult = useMemo(() => {
    const val = parseFloat(fromValue);
    if (isNaN(val)) return 0;
    return convertUnit(val, fromUnitId, toUnitId, selectedCategory);
  }, [fromValue, fromUnitId, toUnitId, selectedCategory]);

  const formattedResult = useMemo(() => {
    if (isNaN(convertedResult)) return '0';
    // Format precision
    if (Math.abs(convertedResult) < 1e-6 && convertedResult !== 0) {
      return convertedResult.toExponential(6);
    }
    const rounded = Math.round(convertedResult * 1e8) / 1e8;
    return rounded.toLocaleString('id-ID', { maximumFractionDigits: 8 });
  }, [convertedResult]);

  // Swap units
  const handleSwap = () => {
    playFuturisticSound('operator', soundEnabled);
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = () => {
    const fromUnit = category.units.find((u) => u.id === fromUnitId);
    const toUnit = category.units.find((u) => u.id === toUnitId);
    const text = `${fromValue} ${fromUnit?.symbol || ''} = ${formattedResult} ${toUnit?.symbol || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    playFuturisticSound('action', soundEnabled);
    onAddHistory({
      expression: `${fromValue} ${fromUnit?.symbol || ''} ➔ ${toUnit?.symbol || ''}`,
      result: `${formattedResult} ${toUnit?.symbol || ''}`,
      mode: 'konverter',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ruler': return <Ruler className="w-4 h-4" />;
      case 'Scale': return <Scale className="w-4 h-4" />;
      case 'Thermometer': return <Thermometer className="w-4 h-4" />;
      case 'HardDrive': return <HardDrive className="w-4 h-4" />;
      case 'Gauge': return <Gauge className="w-4 h-4" />;
      case 'Grid': return <Grid className="w-4 h-4" />;
      case 'Box': return <Box className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      default: return <Ruler className="w-4 h-4" />;
    }
  };

  const fromUnitObj = category.units.find((u) => u.id === fromUnitId);
  const toUnitObj = category.units.find((u) => u.id === toUnitId);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Category Pills Bar */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 min-w-max">
          {UNIT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`unit-cat-${cat.id}`}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? `${theme.activeTab} ring-1 ring-sky-500/50 dark:ring-cyan-400/50 scale-[1.02]`
                    : theme.inactiveTab
                }`}
              >
                <span className={isSelected ? theme.textPrimary : theme.isLight ? 'text-slate-500' : 'text-slate-400'}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span>{cat.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Converter Card */}
      <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${theme.displayBg}`}>
        {/* Source Unit Input Box */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className={theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}>DARI (FROM):</span>
            <select
              value={fromUnitId}
              onChange={(e) => {
                playFuturisticSound('switch', soundEnabled);
                setFromUnitId(e.target.value);
              }}
              className={`font-semibold px-2.5 py-1 rounded-lg border text-xs focus:outline-none transition-colors ${
                theme.isLight
                  ? 'bg-white text-sky-800 border-slate-300 focus:border-sky-500 shadow-xs'
                  : 'bg-slate-900 text-cyan-300 border-slate-700 focus:border-cyan-400'
              }`}
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id} className={theme.isLight ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className={`w-full py-2.5 px-3.5 rounded-xl font-mono text-lg font-bold border focus:outline-none transition-all ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                  : 'bg-slate-950/80 border-slate-800 text-white focus:border-cyan-400'
              }`}
              placeholder="0"
            />
            <span className={`absolute right-3.5 font-mono text-sm font-bold ${
              theme.isLight ? 'text-sky-600' : 'text-cyan-400'
            }`}>
              {fromUnitObj?.symbol}
            </span>
          </div>
        </div>

        {/* Swap Divider Button */}
        <div className="relative flex items-center justify-center my-0.5">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${theme.isLight ? 'border-slate-200' : 'border-slate-800'}`} />
          </div>
          <button
            id="btn-swap-units"
            onClick={handleSwap}
            className={`relative p-2 rounded-full border shadow-md active:scale-95 transition-all ${theme.btnOperator}`}
            title="Tukar Satuan (Swap)"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Target Unit Result Box */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className={theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}>KE (TO / HASIL):</span>
            <select
              value={toUnitId}
              onChange={(e) => {
                playFuturisticSound('switch', soundEnabled);
                setToUnitId(e.target.value);
              }}
              className={`font-semibold px-2.5 py-1 rounded-lg border text-xs focus:outline-none transition-colors ${
                theme.isLight
                  ? 'bg-white text-pink-700 border-slate-300 focus:border-pink-500 shadow-xs'
                  : 'bg-slate-900 text-pink-300 border-slate-700 focus:border-pink-400'
              }`}
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id} className={theme.isLight ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between ${
            theme.isLight ? 'bg-white/90 border-pink-200 shadow-xs' : 'bg-slate-950/90 border-pink-500/30'
          }`}>
            <span className={`font-mono text-xl font-extrabold tracking-wide break-all ${theme.textSecondary}`}>
              {formattedResult}
            </span>
            <span className={`font-mono text-sm font-bold ml-2 ${
              theme.isLight ? 'text-pink-600' : 'text-pink-400'
            }`}>
              {toUnitObj?.symbol}
            </span>
          </div>
        </div>

        {/* Formula summary & Copy */}
        <div className={`pt-2 border-t flex items-center justify-between text-xs ${
          theme.isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          <span className={`text-[11px] font-mono line-clamp-1 ${
            theme.isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            1 {fromUnitObj?.symbol} = {convertUnit(1, fromUnitId, toUnitId, selectedCategory).toLocaleString('id-ID', { maximumFractionDigits: 6 })} {toUnitObj?.symbol}
          </span>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              theme.isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">Tersimpan</span>
              </>
            ) : (
              <>
                <Copy className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
                <span className="font-medium">Salin & Rekam</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Adjust Numeric Buttons */}
      <div className="grid grid-cols-6 gap-1.5">
        {[
          { label: '+1', act: () => setFromValue((prev) => ((parseFloat(prev) || 0) + 1).toString()) },
          { label: '+10', act: () => setFromValue((prev) => ((parseFloat(prev) || 0) + 10).toString()) },
          { label: '+100', act: () => setFromValue((prev) => ((parseFloat(prev) || 0) + 100).toString()) },
          { label: '×10', act: () => setFromValue((prev) => ((parseFloat(prev) || 0) * 10).toString()) },
          { label: '÷10', act: () => setFromValue((prev) => ((parseFloat(prev) || 0) / 10).toString()) },
          { label: 'AC', act: () => setFromValue('1') },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => {
              playFuturisticSound('digit', soundEnabled);
              btn.act();
            }}
            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {btn.label === 'AC' ? <RotateCcw className="w-3.5 h-3.5 mx-auto" /> : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
