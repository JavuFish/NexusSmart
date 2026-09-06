import React, { useState } from 'react';
import { Delete, RotateCcw, Copy, Check, Binary, Cpu } from 'lucide-react';
import { BitWordSize, CalculationHistoryItem, ThemeConfig } from '../types';
import {
  clampToWordSize,
  formatBinary,
  formatDecimal,
  formatHex,
  formatOctal,
  getBitLength,
  getBitMask,
  toSignedDecimal,
} from '../utils/programmer';
import { playFuturisticSound } from '../utils/audio';

interface ProgrammerModeProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
  onAddHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

type BaseMode = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export const ProgrammerMode: React.FC<ProgrammerModeProps> = ({
  theme,
  soundEnabled,
  onAddHistory,
}) => {
  const [currentValue, setCurrentValue] = useState<bigint>(0n);
  const [pendingValue, setPendingValue] = useState<bigint | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [activeBase, setActiveBase] = useState<BaseMode>('DEC');
  const [wordSize, setWordSize] = useState<BitWordSize>('QWORD');
  const [copiedBase, setCopiedBase] = useState<string | null>(null);
  const [isTypingNewNumber, setIsTypingNewNumber] = useState<boolean>(true);

  const bitLength = getBitLength(wordSize);

  // Copy helper
  const handleCopy = (base: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBase(base);
    playFuturisticSound('action', soundEnabled);
    setTimeout(() => setCopiedBase(null), 1800);
  };

  // Toggle individual bit from the bitboard
  const handleToggleBit = (bitIndex: number) => {
    playFuturisticSound('digit', soundEnabled);
    const bitMask = 1n << BigInt(bitIndex);
    const newVal = clampToWordSize(currentValue ^ bitMask, wordSize);
    setCurrentValue(newVal);
    setIsTypingNewNumber(false);
  };

  // Input digit based on active base
  const handleInputDigit = (digit: string) => {
    playFuturisticSound('digit', soundEnabled);
    let radix = 10;
    if (activeBase === 'HEX') radix = 16;
    if (activeBase === 'OCT') radix = 8;
    if (activeBase === 'BIN') radix = 2;

    try {
      const digitBigInt = BigInt(parseInt(digit, radix));
      let nextVal: bigint;
      if (isTypingNewNumber) {
        nextVal = digitBigInt;
        setIsTypingNewNumber(false);
      } else {
        nextVal = currentValue * BigInt(radix) + digitBigInt;
      }
      setCurrentValue(clampToWordSize(nextVal, wordSize));
    } catch {
      // Ignore parse error
    }
  };

  const handleClear = () => {
    playFuturisticSound('delete', soundEnabled);
    setCurrentValue(0n);
    setPendingValue(null);
    setPendingOp(null);
    setIsTypingNewNumber(true);
  };

  const handleBackspace = () => {
    playFuturisticSound('delete', soundEnabled);
    let radix = 10;
    if (activeBase === 'HEX') radix = 16;
    if (activeBase === 'OCT') radix = 8;
    if (activeBase === 'BIN') radix = 2;

    const nextVal = currentValue / BigInt(radix);
    setCurrentValue(nextVal);
  };

  // Execute binary operation
  const executeOperation = (a: bigint, b: bigint, op: string): bigint => {
    const mask = getBitMask(wordSize);
    switch (op) {
      case 'AND': return a & b;
      case 'OR': return a | b;
      case 'XOR': return a ^ b;
      case 'NAND': return mask ^ (a & b);
      case 'NOR': return mask ^ (a | b);
      case 'XNOR': return mask ^ (a ^ b);
      case 'LSH': return a << (b & 63n);
      case 'RSH': return a >> (b & 63n);
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0n ? 0n : a / b;
      case 'MOD': return b === 0n ? 0n : a % b;
      default: return b;
    }
  };

  const handleOperator = (op: string) => {
    playFuturisticSound('operator', soundEnabled);
    if (pendingValue !== null && pendingOp) {
      const res = clampToWordSize(executeOperation(pendingValue, currentValue, pendingOp), wordSize);
      setPendingValue(res);
      setCurrentValue(res);
    } else {
      setPendingValue(currentValue);
    }
    setPendingOp(op);
    setIsTypingNewNumber(true);
  };

  const handleCalculateEqual = () => {
    if (pendingValue !== null && pendingOp) {
      playFuturisticSound('equal', soundEnabled);
      const res = clampToWordSize(executeOperation(pendingValue, currentValue, pendingOp), wordSize);
      const expr = `${pendingValue.toString(10)} ${pendingOp} ${currentValue.toString(10)}`;
      onAddHistory({
        expression: `(${activeBase}) ${expr}`,
        result: `${res.toString(10)} (HEX: ${formatHex(res, wordSize)})`,
        mode: 'programmer',
      });
      setCurrentValue(res);
      setPendingValue(null);
      setPendingOp(null);
      setIsTypingNewNumber(true);
    }
  };

  const handleUnaryOp = (op: 'NOT' | 'NEG') => {
    playFuturisticSound('operator', soundEnabled);
    if (op === 'NOT') {
      const mask = getBitMask(wordSize);
      const res = clampToWordSize(mask ^ currentValue, wordSize);
      setCurrentValue(res);
    } else if (op === 'NEG') {
      const res = clampToWordSize(0n - currentValue, wordSize);
      setCurrentValue(res);
    }
  };

  // Determine enabled keypad keys
  const isKeyDisabled = (char: string): boolean => {
    if (activeBase === 'BIN') {
      return !['0', '1'].includes(char);
    }
    if (activeBase === 'OCT') {
      return !['0', '1', '2', '3', '4', '5', '6', '7'].includes(char);
    }
    if (activeBase === 'DEC') {
      return ['A', 'B', 'C', 'D', 'E', 'F'].includes(char);
    }
    return false; // In HEX all 0-9 and A-F enabled
  };

  // Convert BigInt to binary array for bitboard
  const bits: boolean[] = [];
  for (let i = bitLength - 1; i >= 0; i--) {
    const mask = 1n << BigInt(i);
    bits.push((currentValue & mask) !== 0n);
  }

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* 4 Bases Display Card */}
      <div className={`w-full p-3 rounded-2xl border flex flex-col gap-2 ${theme.displayBg}`}>
        {/* Word Size & Header */}
        <div className={`flex items-center justify-between pb-1 border-b text-[11px] ${
          theme.isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          <div className={`flex items-center gap-1.5 font-mono ${
            theme.isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'
          }`}>
            <Cpu className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
            <span>BIT DEPTH:</span>
          </div>

          <div className="flex items-center gap-1">
            {(['QWORD', 'DWORD', 'WORD', 'BYTE'] as BitWordSize[]).map((size) => (
              <button
                key={size}
                id={`btn-wordsize-${size}`}
                onClick={() => {
                  playFuturisticSound('switch', soundEnabled);
                  setWordSize(size);
                  setCurrentValue((prev) => clampToWordSize(prev, size));
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  wordSize === size
                    ? theme.isLight
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : theme.isLight
                    ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Bases Rows (Click row to make it active input base) */}
        <div className="space-y-1.5 font-mono text-xs">
          {/* HEX */}
          <div
            onClick={() => {
              playFuturisticSound('switch', soundEnabled);
              setActiveBase('HEX');
            }}
            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
              activeBase === 'HEX'
                ? theme.isLight
                  ? 'bg-sky-50 border-sky-400 text-sky-900 ring-1 ring-sky-300'
                  : 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 ring-1 ring-cyan-400/40'
                : theme.isLight
                ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-slate-300'
                : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-10 font-bold text-[11px] ${theme.isLight ? 'text-sky-700' : 'text-cyan-400'}`}>HEX</span>
              <span className="font-extrabold text-sm tracking-wider">
                {formatHex(currentValue, wordSize) || '0'}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy('HEX', formatHex(currentValue, wordSize));
              }}
              className={`p-1 rounded transition-colors ${theme.isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              title="Salin Nilai Hex"
            >
              {copiedBase === 'HEX' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* DEC */}
          <div
            onClick={() => {
              playFuturisticSound('switch', soundEnabled);
              setActiveBase('DEC');
            }}
            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
              activeBase === 'DEC'
                ? theme.isLight
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-300'
                  : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-400/40'
                : theme.isLight
                ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-slate-300'
                : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-10 font-bold text-[11px] ${theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>DEC</span>
              <span className="font-extrabold text-sm tracking-wider">
                {formatDecimal(currentValue, wordSize) || '0'}
              </span>
              <span className={`text-[10px] ${theme.isLight ? 'text-slate-500 font-medium' : 'text-slate-500'}`}>
                (Signed: {toSignedDecimal(currentValue, wordSize)})
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy('DEC', formatDecimal(currentValue, wordSize));
              }}
              className={`p-1 rounded transition-colors ${theme.isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              title="Salin Nilai Desimal"
            >
              {copiedBase === 'DEC' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* OCT */}
          <div
            onClick={() => {
              playFuturisticSound('switch', soundEnabled);
              setActiveBase('OCT');
            }}
            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
              activeBase === 'OCT'
                ? theme.isLight
                  ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-300'
                  : 'bg-amber-950/40 border-amber-500/60 text-amber-300 ring-1 ring-amber-400/40'
                : theme.isLight
                ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-slate-300'
                : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-10 font-bold text-[11px] ${theme.isLight ? 'text-amber-700' : 'text-amber-400'}`}>OCT</span>
              <span className="font-extrabold text-sm tracking-wider">
                {formatOctal(currentValue, wordSize) || '0'}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy('OCT', formatOctal(currentValue, wordSize));
              }}
              className={`p-1 rounded transition-colors ${theme.isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              title="Salin Nilai Oktal"
            >
              {copiedBase === 'OCT' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* BIN */}
          <div
            onClick={() => {
              playFuturisticSound('switch', soundEnabled);
              setActiveBase('BIN');
            }}
            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
              activeBase === 'BIN'
                ? theme.isLight
                  ? 'bg-pink-50 border-pink-400 text-pink-900 ring-1 ring-pink-300'
                  : 'bg-pink-950/40 border-pink-500/60 text-pink-300 ring-1 ring-pink-400/40'
                : theme.isLight
                ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-slate-300'
                : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`w-10 font-bold text-[11px] flex-shrink-0 ${theme.isLight ? 'text-pink-700' : 'text-pink-400'}`}>BIN</span>
              <span className="font-extrabold text-xs sm:text-sm tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap">
                {formatBinary(currentValue, wordSize)}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy('BIN', formatBinary(currentValue, wordSize));
              }}
              className={`p-1 rounded transition-colors flex-shrink-0 ${theme.isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              title="Salin Nilai Biner"
            >
              {copiedBase === 'BIN' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 64/32/16/8 Bitboard Visualizer */}
      <div className={`p-2.5 rounded-xl border ${
        theme.isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-950/80 border-slate-800/80'
      }`}>
        <div className={`flex items-center justify-between mb-1.5 text-[10px] font-mono ${
          theme.isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'
        }`}>
          <span className="flex items-center gap-1">
            <Binary className={`w-3 h-3 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
            <span>PAPAN BIT INTERAKTIF (Klik bit untuk ubah 0 ↔ 1):</span>
          </span>
          <span>MSB (Kiri) → LSB (Kanan)</span>
        </div>

        {/* Bit Grid Matrix */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
          {bits.map((bitVal, idx) => {
            const bitIndex = bitLength - 1 - idx;
            return (
              <button
                key={bitIndex}
                id={`bit-${bitIndex}`}
                onClick={() => handleToggleBit(bitIndex)}
                className={`py-1 rounded flex flex-col items-center justify-center transition-all ${
                  bitVal
                    ? theme.isLight
                      ? 'bg-sky-600 text-white font-extrabold shadow-xs scale-[1.03]'
                      : 'bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.6)] scale-[1.03]'
                    : theme.isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                    : 'bg-slate-900/90 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                }`}
                title={`Bit #${bitIndex} : Nilai ${bitVal ? '1' : '0'}`}
              >
                <span className="text-[11px] font-mono font-bold leading-none">{bitVal ? '1' : '0'}</span>
                <span className="text-[7px] font-mono opacity-60 leading-none mt-0.5">{bitIndex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logic & Shift Operations Bar */}
      <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
        {(['AND', 'OR', 'XOR', 'NOT', 'LSH', 'RSH'] as const).map((op) => (
          <button
            key={op}
            id={`btn-logic-${op}`}
            onClick={() => {
              if (op === 'NOT') handleUnaryOp('NOT');
              else handleOperator(op);
            }}
            className={`py-2 rounded-lg font-bold transition-all ${
              pendingOp === op
                ? theme.isLight
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : theme.isLight
                ? 'bg-white hover:bg-slate-100 text-sky-800 border border-slate-200 shadow-2xs'
                : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-slate-800'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Hex & Number Keypad */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Row 1 */}
        {['D', 'E', 'F'].map((hexChar) => (
          <button
            key={hexChar}
            id={`btn-hex-${hexChar}`}
            disabled={isKeyDisabled(hexChar)}
            onClick={() => handleInputDigit(hexChar)}
            className={`py-2.5 rounded-xl font-mono font-bold text-sm transition-colors ${
              isKeyDisabled(hexChar)
                ? theme.isLight
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                : theme.isLight
                ? 'bg-white text-sky-800 border border-slate-300 hover:border-sky-500 shadow-2xs'
                : 'bg-slate-900 text-cyan-300 border border-slate-800 hover:border-cyan-400'
            }`}
          >
            {hexChar}
          </button>
        ))}
        <button
          id="btn-prog-clear"
          onClick={handleClear}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnAction}`}
        >
          <RotateCcw className="w-4 h-4 mx-auto" />
        </button>

        {/* Row 2 */}
        {['A', 'B', 'C'].map((hexChar) => (
          <button
            key={hexChar}
            id={`btn-hex-${hexChar}`}
            disabled={isKeyDisabled(hexChar)}
            onClick={() => handleInputDigit(hexChar)}
            className={`py-2.5 rounded-xl font-mono font-bold text-sm transition-colors ${
              isKeyDisabled(hexChar)
                ? theme.isLight
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                : theme.isLight
                ? 'bg-white text-sky-800 border border-slate-300 hover:border-sky-500 shadow-2xs'
                : 'bg-slate-900 text-cyan-300 border border-slate-800 hover:border-cyan-400'
            }`}
          >
            {hexChar}
          </button>
        ))}
        <button
          id="btn-prog-backspace"
          onClick={handleBackspace}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnDefault}`}
        >
          <Delete className="w-4 h-4 mx-auto" />
        </button>

        {/* Row 3 */}
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            id={`btn-digit-${digit}`}
            disabled={isKeyDisabled(digit)}
            onClick={() => handleInputDigit(digit)}
            className={`py-2.5 rounded-xl font-mono font-bold text-sm ${
              isKeyDisabled(digit)
                ? theme.isLight
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                : theme.btnDefault
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          id="btn-prog-div"
          onClick={() => handleOperator('÷')}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnOperator}`}
        >
          ÷
        </button>

        {/* Row 4 */}
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            id={`btn-digit-${digit}`}
            disabled={isKeyDisabled(digit)}
            onClick={() => handleInputDigit(digit)}
            className={`py-2.5 rounded-xl font-mono font-bold text-sm ${
              isKeyDisabled(digit)
                ? theme.isLight
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                : theme.btnDefault
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          id="btn-prog-mul"
          onClick={() => handleOperator('×')}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnOperator}`}
        >
          ×
        </button>

        {/* Row 5 */}
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            id={`btn-digit-${digit}`}
            disabled={isKeyDisabled(digit)}
            onClick={() => handleInputDigit(digit)}
            className={`py-2.5 rounded-xl font-mono font-bold text-sm ${
              isKeyDisabled(digit)
                ? theme.isLight
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                : theme.btnDefault
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          id="btn-prog-sub"
          onClick={() => handleOperator('−')}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnOperator}`}
        >
          −
        </button>

        {/* Row 6 */}
        <button
          id="btn-prog-neg"
          onClick={() => handleUnaryOp('NEG')}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnDefault}`}
        >
          ±
        </button>
        <button
          id="btn-digit-0"
          onClick={() => handleInputDigit('0')}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnDefault}`}
        >
          0
        </button>
        <button
          id="btn-prog-add"
          onClick={() => handleOperator('+')}
          className={`py-2.5 rounded-xl font-mono font-bold text-sm ${theme.btnOperator}`}
        >
          +
        </button>
        <button
          id="btn-prog-equal"
          onClick={handleCalculateEqual}
          className={`py-2.5 rounded-xl font-mono font-extrabold text-sm ${theme.btnEqual}`}
        >
          =
        </button>
      </div>
    </div>
  );
};
