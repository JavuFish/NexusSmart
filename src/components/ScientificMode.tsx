import React, { useState, useEffect, useCallback } from 'react';
import {
  Delete,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Equal,
} from 'lucide-react';
import { AngleUnit, CalculationHistoryItem, ThemeConfig } from '../types';
import { evaluateExpression, formatCalculationResult } from '../utils/calculator';
import { playFuturisticSound } from '../utils/audio';

interface ScientificModeProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
  onAddHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const ScientificMode: React.FC<ScientificModeProps> = ({
  theme,
  soundEnabled,
  onAddHistory,
}) => {
  const [expression, setExpression] = useState<string>('');
  const [livePreview, setLivePreview] = useState<string>('');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [showScientificRow, setShowScientificRow] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live calculation preview
  useEffect(() => {
    if (!expression.trim()) {
      setLivePreview('');
      setErrorMessage(null);
      return;
    }
    const { result, error } = evaluateExpression(expression, angleUnit);
    if (error || isNaN(result)) {
      setLivePreview('');
      // Do not flash error on partial typings like "5+"
    } else {
      setLivePreview(formatCalculationResult(result));
      setErrorMessage(null);
    }
  }, [expression, angleUnit]);

  // Insert token into expression
  const handleInsert = useCallback(
    (token: string) => {
      playFuturisticSound('digit', soundEnabled);
      setErrorMessage(null);
      setExpression((prev) => prev + token);
    },
    [soundEnabled]
  );

  const handleOperator = useCallback(
    (op: string) => {
      playFuturisticSound('operator', soundEnabled);
      setErrorMessage(null);
      setExpression((prev) => {
        if (!prev && (op === '×' || op === '÷' || op === '%')) return '';
        return prev + op;
      });
    },
    [soundEnabled]
  );

  const handleClear = useCallback(() => {
    playFuturisticSound('delete', soundEnabled);
    setExpression('');
    setLivePreview('');
    setErrorMessage(null);
  }, [soundEnabled]);

  const handleBackspace = useCallback(() => {
    playFuturisticSound('delete', soundEnabled);
    setErrorMessage(null);
    setExpression((prev) => {
      if (prev.endsWith('sin(') || prev.endsWith('cos(') || prev.endsWith('tan(') || prev.endsWith('log(')) {
        return prev.slice(0, -4);
      }
      if (prev.endsWith('asin(') || prev.endsWith('acos(') || prev.endsWith('atan(') || prev.endsWith('sqrt(')) {
        return prev.slice(0, -5);
      }
      if (prev.endsWith('ln(')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  }, [soundEnabled]);

  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const { result, error } = evaluateExpression(expression, angleUnit);
    if (error || isNaN(result)) {
      playFuturisticSound('error', soundEnabled);
      setErrorMessage(error || 'Format Tidak Valid');
    } else {
      playFuturisticSound('equal', soundEnabled);
      const formatted = formatCalculationResult(result);
      onAddHistory({
        expression: expression,
        result: formatted,
        mode: 'ilmiah',
      });
      setExpression(formatted.replace(/,/g, ''));
      setLivePreview('');
      setErrorMessage(null);
    }
  }, [expression, angleUnit, soundEnabled, onAddHistory]);

  const handleNegate = useCallback(() => {
    playFuturisticSound('operator', soundEnabled);
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  }, [soundEnabled]);

  // Memory operations
  const handleMemory = (type: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    playFuturisticSound('action', soundEnabled);
    const currNum = parseFloat(expression) || (livePreview ? parseFloat(livePreview.replace(/,/g, '')) : 0);

    switch (type) {
      case 'MC':
        setMemoryValue(0);
        break;
      case 'MR':
        setExpression((prev) => prev + memoryValue.toString());
        break;
      case 'M+':
        setMemoryValue((prev) => prev + (currNum || 0));
        break;
      case 'M-':
        setMemoryValue((prev) => prev - (currNum || 0));
        break;
      case 'MS':
        setMemoryValue(currNum || 0);
        break;
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when user is in other inputs
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.key >= '0' && e.key <= '9') {
        handleInsert(e.key);
      } else if (e.key === '.') {
        handleInsert('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('−');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        handleOperator('%');
      } else if (e.key === '(' || e.key === ')') {
        handleInsert(e.key);
      } else if (e.key === '^') {
        handleInsert('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInsert, handleOperator, handleCalculate, handleBackspace, handleClear]);

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Smart Futuristic Display */}
      <div
        className={`w-full p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all relative overflow-hidden ${theme.displayBg}`}
        id="scientific-display"
      >
        {/* Top display status row */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playFuturisticSound('switch', soundEnabled);
                setAngleUnit((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'));
              }}
              className={`px-2 py-0.5 rounded font-bold transition-colors border ${
                theme.isLight
                  ? 'bg-white border-slate-200 text-sky-700 hover:bg-slate-50 shadow-xs'
                  : 'bg-slate-900/80 border-slate-700 text-cyan-300 hover:bg-slate-800'
              }`}
              title="Ganti Sudut Derajat (DEG) / Radian (RAD)"
            >
              {angleUnit}
            </button>

            {memoryValue !== 0 && (
              <span className={`px-1.5 py-0.5 rounded border font-semibold text-[10px] animate-pulse ${
                theme.isLight
                  ? 'bg-pink-100 border-pink-200 text-pink-700'
                  : 'bg-pink-950/70 border-pink-500/40 text-pink-300'
              }`}>
                MEM: {memoryValue}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] uppercase tracking-widest font-mono ${theme.textSub}`}>
              SMART ENGINE
            </span>
          </div>
        </div>

        {/* Expression line */}
        <div className="w-full text-right mt-1">
          <div className={`text-sm sm:text-base font-mono tracking-wide overflow-x-auto no-scrollbar whitespace-nowrap break-normal min-h-[24px] ${
            theme.isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'
          }`}>
            {expression || <span className={theme.isLight ? 'text-slate-400' : 'text-slate-600'}>0</span>}
          </div>
        </div>

        {/* Live Preview / Error / Main Result */}
        <div className="w-full flex items-baseline justify-end gap-2 text-right mt-1">
          {errorMessage ? (
            <span className="text-xs text-red-500 font-mono tracking-tight font-semibold">{errorMessage}</span>
          ) : livePreview ? (
            <span className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight ${theme.textPrimary}`}>
              = {livePreview}
            </span>
          ) : (
            <span className={`text-xs font-mono ${theme.isLight ? 'text-slate-400' : 'text-slate-600'}`}>Siap Menghitung</span>
          )}
        </div>
      </div>

      {/* Memory Bar */}
      <div className="grid grid-cols-5 gap-1.5">
        {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((mKey) => (
          <button
            key={mKey}
            id={`mem-btn-${mKey}`}
            onClick={() => handleMemory(mKey)}
            className={`py-1.5 rounded-lg border text-[11px] font-mono transition-colors active:scale-95 ${
              theme.isLight
                ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-700 font-medium'
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {mKey}
          </button>
        ))}
      </div>

      {/* Scientific Expand / Collapse Toggle Bar */}
      <div className="flex items-center justify-between px-1">
        <button
          id="toggle-scientific-drawer"
          onClick={() => {
            playFuturisticSound('switch', soundEnabled);
            setShowScientificRow((prev) => !prev);
          }}
          className={`flex items-center gap-1 text-[11px] font-semibold py-1 transition-colors ${
            theme.isLight ? 'text-sky-700 hover:text-sky-800' : 'text-cyan-400 hover:text-cyan-300'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{showScientificRow ? 'Sembunyikan Panel Ilmiah' : 'Buka Panel Fungsi Ilmiah (Sin, Cos, Log, Akar)'}</span>
          {showScientificRow ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showScientificRow && (
          <button
            id="toggle-2nd-mode"
            onClick={() => {
              playFuturisticSound('switch', soundEnabled);
              setIsSecondMode((prev) => !prev);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
              isSecondMode
                ? theme.isLight
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-xs'
                  : 'bg-pink-500 text-white border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                : theme.isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            2nd {isSecondMode ? 'ON' : 'OFF'}
          </button>
        )}
      </div>

      {/* Scientific Keys Grid */}
      {showScientificRow && (
        <div className={`grid grid-cols-6 gap-1.5 p-2 rounded-xl border ${
          theme.isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
        }`}>
          {/* Row 1 */}
          <button
            onClick={() => handleInsert(isSecondMode ? 'asin(' : 'sin(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            {isSecondMode ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            onClick={() => handleInsert(isSecondMode ? 'acos(' : 'cos(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            {isSecondMode ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            onClick={() => handleInsert(isSecondMode ? 'atan(' : 'tan(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            {isSecondMode ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            onClick={() => handleInsert('π')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-amber-700 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-amber-300'
            }`}
          >
            π
          </button>
          <button
            onClick={() => handleInsert('e')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-amber-700 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-amber-300'
            }`}
          >
            e
          </button>
          <button
            onClick={() => handleInsert('^')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            xʸ
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleInsert(isSecondMode ? '10^(' : 'log(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            {isSecondMode ? '10ˣ' : 'log'}
          </button>
          <button
            onClick={() => handleInsert(isSecondMode ? 'exp(' : 'ln(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            {isSecondMode ? 'eˣ' : 'ln'}
          </button>
          <button
            onClick={() => handleInsert(isSecondMode ? '∛(' : '√(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            {isSecondMode ? '∛x' : '√x'}
          </button>
          <button
            onClick={() => handleInsert('^2')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            x²
          </button>
          <button
            onClick={() => handleInsert('!')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            n!
          </button>
          <button
            onClick={() => handleInsert('abs(')}
            className={`p-2 rounded-lg border text-xs font-mono active:scale-95 transition-all font-semibold ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-sky-800 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
          >
            |x|
          </button>
        </div>
      )}

      {/* Main Standard Keypad (4 Columns) */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button
          id="btn-clear"
          onClick={handleClear}
          className={`py-3.5 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-1 ${theme.btnAction}`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>AC</span>
        </button>
        <button
          id="btn-parentheses"
          onClick={() => {
            // Smart bracket insertion: check open vs closed counts
            const opens = (expression.match(/\(/g) || []).length;
            const closes = (expression.match(/\)/g) || []).length;
            if (opens > closes && !expression.endsWith('(') && !['+', '−', '×', '÷'].includes(expression.slice(-1))) {
              handleInsert(')');
            } else {
              handleInsert('(');
            }
          }}
          className={`py-3.5 rounded-xl font-mono font-bold text-sm ${theme.btnDefault}`}
        >
          ( )
        </button>
        <button
          id="btn-backspace"
          onClick={handleBackspace}
          className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center ${theme.btnDefault}`}
          title="Hapus Satu Karakter"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          id="btn-op-divide"
          onClick={() => handleOperator('÷')}
          className={`py-3.5 rounded-xl font-mono font-extrabold text-base ${theme.btnOperator}`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          id="btn-num-7"
          onClick={() => handleInsert('7')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          7
        </button>
        <button
          id="btn-num-8"
          onClick={() => handleInsert('8')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          8
        </button>
        <button
          id="btn-num-9"
          onClick={() => handleInsert('9')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          9
        </button>
        <button
          id="btn-op-multiply"
          onClick={() => handleOperator('×')}
          className={`py-3.5 rounded-xl font-mono font-extrabold text-base ${theme.btnOperator}`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          id="btn-num-4"
          onClick={() => handleInsert('4')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          4
        </button>
        <button
          id="btn-num-5"
          onClick={() => handleInsert('5')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          5
        </button>
        <button
          id="btn-num-6"
          onClick={() => handleInsert('6')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          6
        </button>
        <button
          id="btn-op-subtract"
          onClick={() => handleOperator('−')}
          className={`py-3.5 rounded-xl font-mono font-extrabold text-base ${theme.btnOperator}`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          id="btn-num-1"
          onClick={() => handleInsert('1')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          1
        </button>
        <button
          id="btn-num-2"
          onClick={() => handleInsert('2')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          2
        </button>
        <button
          id="btn-num-3"
          onClick={() => handleInsert('3')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          3
        </button>
        <button
          id="btn-op-add"
          onClick={() => handleOperator('+')}
          className={`py-3.5 rounded-xl font-mono font-extrabold text-base ${theme.btnOperator}`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          id="btn-negate"
          onClick={handleNegate}
          className={`py-3.5 rounded-xl font-mono font-bold text-sm ${theme.btnDefault}`}
        >
          ±
        </button>
        <button
          id="btn-num-0"
          onClick={() => handleInsert('0')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          0
        </button>
        <button
          id="btn-dot"
          onClick={() => handleInsert('.')}
          className={`py-3.5 rounded-xl font-mono font-bold text-base ${theme.btnDefault}`}
        >
          .
        </button>
        <button
          id="btn-calculate-equal"
          onClick={handleCalculate}
          className={`py-3.5 rounded-xl font-mono font-extrabold text-lg flex items-center justify-center ${theme.btnEqual}`}
        >
          <Equal className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
