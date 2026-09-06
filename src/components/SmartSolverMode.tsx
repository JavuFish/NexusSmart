import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  LineChart,
  BrainCircuit,
  Scale,
  Calendar,
  Sparkles,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { CalculationHistoryItem, SolverSubMode, ThemeConfig } from '../types';
import {
  calculateAgeDate,
  calculateBmi,
  evaluateFunctionY,
  solveLinearSystem,
  solveQuadratic,
} from '../utils/mathSolver';
import { playFuturisticSound } from '../utils/audio';

interface SmartSolverModeProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
  onAddHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const SmartSolverMode: React.FC<SmartSolverModeProps> = ({
  theme,
  soundEnabled,
  onAddHistory,
}) => {
  const [subMode, setSubMode] = useState<SolverSubMode>('graph');
  const [copied, setCopied] = useState<boolean>(false);

  // Confetti overlay canvas ref
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);

  // Trigger subtle localized confetti effect
  const triggerSubtleConfetti = useCallback((options?: { x?: number; y?: number; count?: number }) => {
    try {
      const canvas = confettiCanvasRef.current;
      if (!canvas) return;

      if (!confettiInstanceRef.current) {
        confettiInstanceRef.current = confetti.create(canvas, {
          resize: true,
          useWorker: true,
        });
      }

      const colors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#a855f7', '#38bdf8'];
      confettiInstanceRef.current({
        particleCount: options?.count || 28,
        spread: 60,
        origin: { x: options?.x ?? 0.5, y: options?.y ?? 0.5 },
        colors,
        ticks: 90,
        gravity: 1.1,
        scalar: 0.75,
        shapes: ['circle', 'square'],
        disableForReducedMotion: true,
      });
    } catch {
      // Fallback gracefully if canvas context is not ready
    }
  }, []);

  // Graph states
  const [funcInput, setFuncInput] = useState<string>('sin(x) * 2');
  const [zoomScale, setZoomScale] = useState<number>(30); // pixels per unit
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quadratic states
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('-5');
  const [quadC, setQuadC] = useState<string>('6');

  // Linear states
  const [linA1, setLinA1] = useState<string>('2');
  const [linB1, setLinB1] = useState<string>('3');
  const [linC1, setLinC1] = useState<string>('12');
  const [linA2, setLinA2] = useState<string>('1');
  const [linB2, setLinB2] = useState<string>('-1');
  const [linC2, setLinC2] = useState<string>('1');

  // BMI states
  const [bmiWeight, setBmiWeight] = useState<string>('65');
  const [bmiHeight, setBmiHeight] = useState<string>('170');
  const [bmiAge, setBmiAge] = useState<string>('25');
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>('male');

  // Date states
  const [birthDate, setBirthDate] = useState<string>('2000-01-15');

  // Draw 2D Graph on Canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.fillStyle = theme.isLight ? '#f8fafc' : '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Gridlines
    ctx.strokeStyle = theme.isLight ? '#e2e8f0' : '#1e293b';
    ctx.lineWidth = 1;

    const step = zoomScale;

    // Vertical gridlines
    for (let x = centerX % step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal gridlines
    for (let y = centerY % step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // X and Y Main Axes
    ctx.strokeStyle = theme.isLight ? '#0284c7' : '#06b6d4';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis coordinate numbers
    ctx.fillStyle = theme.isLight ? '#64748b' : '#94a3b8';
    ctx.font = '9px monospace';
    for (let x = centerX + step; x < width; x += step) {
      const val = Math.round((x - centerX) / step);
      ctx.fillText(val.toString(), x - 4, centerY + 12);
    }
    for (let x = centerX - step; x > 0; x -= step) {
      const val = Math.round((x - centerX) / step);
      ctx.fillText(val.toString(), x - 6, centerY + 12);
    }
    for (let y = centerY - step; y > 0; y -= step) {
      const val = Math.round((centerY - y) / step);
      ctx.fillText(val.toString(), centerX + 4, y + 3);
    }
    for (let y = centerY + step; y < height; y += step) {
      const val = Math.round((centerY - y) / step);
      ctx.fillText(val.toString(), centerX + 4, y + 3);
    }

    // Plot function y = f(x)
    ctx.strokeStyle = theme.isLight ? '#db2777' : '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let isFirst = true;
    for (let px = 0; px <= width; px += 2) {
      const mathX = (px - centerX) / step;
      const mathY = evaluateFunctionY(funcInput, mathX);

      if (!isNaN(mathY) && isFinite(mathY)) {
        const py = centerY - mathY * step;
        if (py >= -100 && py <= height + 100) {
          if (isFirst) {
            ctx.moveTo(px, py);
            isFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          isFirst = true;
        }
      } else {
        isFirst = true;
      }
    }
    ctx.stroke();
  }, [funcInput, zoomScale, theme.isLight]);

  useEffect(() => {
    if (subMode === 'graph') {
      drawGraph();
    }
  }, [subMode, drawGraph]);

  const handleRecord = (expr: string, res: string) => {
    playFuturisticSound('action', soundEnabled);
    triggerSubtleConfetti({ count: 32 });
    onAddHistory({
      expression: expr,
      result: res,
      mode: 'solver',
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quadResult = solveQuadratic(
    parseFloat(quadA) || 0,
    parseFloat(quadB) || 0,
    parseFloat(quadC) || 0
  );

  const linResult = solveLinearSystem(
    parseFloat(linA1) || 0,
    parseFloat(linB1) || 0,
    parseFloat(linC1) || 0,
    parseFloat(linA2) || 0,
    parseFloat(linB2) || 0,
    parseFloat(linC2) || 0
  );

  const bmiResult = calculateBmi(
    parseFloat(bmiWeight) || 0,
    parseFloat(bmiHeight) || 0,
    parseFloat(bmiAge) || 25,
    bmiGender
  );

  const ageResult = calculateAgeDate(birthDate);

  // Trigger subtle confetti when solving or changing params that result in a computed solution
  const prevSolutionRef = useRef<string>('');
  useEffect(() => {
    let currentSignature = '';
    if (subMode === 'quadratic') {
      currentSignature = `quad-${quadA}-${quadB}-${quadC}-${quadResult.x1}-${quadResult.x2}`;
    } else if (subMode === 'linear') {
      currentSignature = `lin-${linA1}-${linB1}-${linC1}-${linA2}-${linB2}-${linC2}-${linResult.status}-${linResult.x}-${linResult.y}`;
    } else if (subMode === 'bmi') {
      currentSignature = `bmi-${bmiWeight}-${bmiHeight}-${bmiAge}-${bmiGender}-${bmiResult.bmi.toFixed(1)}`;
    } else if (subMode === 'date') {
      currentSignature = `date-${birthDate}-${ageResult?.years}-${ageResult?.months}-${ageResult?.days}`;
    } else if (subMode === 'graph') {
      currentSignature = `graph-${funcInput}`;
    }

    if (prevSolutionRef.current && prevSolutionRef.current !== currentSignature) {
      const timer = setTimeout(() => {
        triggerSubtleConfetti({ count: 20, y: 0.45 });
      }, 150);
      prevSolutionRef.current = currentSignature;
      return () => clearTimeout(timer);
    } else if (!prevSolutionRef.current) {
      prevSolutionRef.current = currentSignature;
    }
  }, [
    subMode,
    quadA,
    quadB,
    quadC,
    quadResult.x1,
    quadResult.x2,
    linA1,
    linB1,
    linC1,
    linA2,
    linB2,
    linC2,
    linResult.status,
    linResult.x,
    linResult.y,
    bmiWeight,
    bmiHeight,
    bmiAge,
    bmiGender,
    bmiResult.bmi,
    birthDate,
    ageResult?.years,
    ageResult?.months,
    ageResult?.days,
    funcInput,
    triggerSubtleConfetti,
  ]);

  return (
    <div className="w-full flex flex-col gap-3 relative">
      {/* Localized Confetti Canvas for solver celebrations */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none z-30 w-full h-full rounded-2xl"
      />

      {/* Sub tabs */}
      <div className={`grid grid-cols-5 gap-1 p-1 rounded-xl border text-[11px] z-10 ${
        theme.isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        {[
          { id: 'graph', label: 'Grafik 2D', icon: <LineChart className="w-3.5 h-3.5" /> },
          { id: 'quadratic', label: 'Kuadrat', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
          { id: 'linear', label: 'SPLDV', icon: <Scale className="w-3.5 h-3.5" /> },
          { id: 'bmi', label: 'BMI Sehat', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'date', label: 'Usia', icon: <Calendar className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = subMode === tab.id;
          return (
            <button
              key={tab.id}
              id={`solver-tab-${tab.id}`}
              onClick={() => {
                playFuturisticSound('switch', soundEnabled);
                setSubMode(tab.id as SolverSubMode);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-lg font-semibold transition-all ${
                isActive
                  ? `${theme.activeTab} ${theme.isLight ? 'font-bold shadow-xs' : 'text-cyan-300 font-bold shadow-md'}`
                  : theme.isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Submode 1: 2D FUNCTION GRAPH PLOTTER */}
      {subMode === 'graph' && (
        <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
              theme.isLight ? 'text-sky-700' : 'text-cyan-400'
            }`}>
              <LineChart className="w-4 h-4" /> Plotter Grafik Matematika 2D: y = f(x)
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomScale((prev) => Math.min(prev + 10, 80))}
                className={`p-1.5 rounded-lg border transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Perbesar (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.max(prev - 10, 10))}
                className={`p-1.5 rounded-lg border transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Perkecil (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(30)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Reset Skala"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Function Input Box */}
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold text-sm ${theme.isLight ? 'text-pink-600' : 'text-pink-400'}`}>y =</span>
            <input
              type="text"
              value={funcInput}
              onChange={(e) => setFuncInput(e.target.value)}
              className={`flex-1 py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
              }`}
              placeholder="sin(x), x^2 - 4, cos(x)"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-mono">
            <span className={`text-[10px] ${theme.isLight ? 'text-slate-500 font-semibold' : 'text-slate-500'}`}>PRESET:</span>
            {[
              'sin(x) * 2',
              'cos(x)',
              'x^2 - 4',
              'x^3 - 3*x',
              '2^x',
              'abs(x)',
              'tan(x)',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  playFuturisticSound('digit', soundEnabled);
                  setFuncInput(preset);
                }}
                className={`px-2 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-200 text-sky-800 hover:bg-slate-50 shadow-xs'
                    : 'bg-slate-900/90 border-slate-800 text-cyan-300 hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Canvas View */}
          <div className={`w-full flex justify-center rounded-xl overflow-hidden border ${
            theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
          }`}>
            <canvas
              ref={canvasRef}
              width={380}
              height={220}
              className="w-full max-w-full h-auto"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() =>
                handleRecord(
                  `Grafik Fungsi: y = ${funcInput}`,
                  `Plot kurva f(x) skala ${zoomScale}px/unit`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                theme.isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />}
              <span>{copied ? 'Tersimpan' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Submode 2: QUADRATIC SOLVER */}
      {subMode === 'quadratic' && (
        <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
            theme.isLight ? 'text-sky-700' : 'text-cyan-400'
          }`}>
            <BrainCircuit className="w-4 h-4" /> Pemecah Persamaan Kuadrat: ax² + bx + c = 0
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-mono ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Nilai a</label>
              <input
                type="number"
                value={quadA}
                onChange={(e) => setQuadA(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-mono ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Nilai b</label>
              <input
                type="number"
                value={quadB}
                onChange={(e) => setQuadB(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-mono ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Nilai c</label>
              <input
                type="number"
                value={quadC}
                onChange={(e) => setQuadC(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                }`}
              />
            </div>
          </div>

          {/* Results Box */}
          <div className={`p-3 rounded-xl border space-y-1.5 ${
            theme.isLight ? 'bg-white/95 border-sky-200 shadow-xs' : 'bg-slate-950/90 border-cyan-500/40'
          }`}>
            <div className={`flex items-center justify-between text-xs font-mono ${
              theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
            }`}>
              <span>Diskriminan (D): <strong className={theme.isLight ? 'text-amber-700' : 'text-amber-400'}>{quadResult.discriminant}</strong></span>
              <span>Puncak: <strong className={theme.isLight ? 'text-sky-700' : 'text-cyan-400'}>({quadResult.vertex.x.toFixed(2)}, {quadResult.vertex.y.toFixed(2)})</strong></span>
            </div>

            <div className={`text-base font-extrabold font-mono flex items-center gap-3 ${
              theme.isLight ? 'text-sky-700' : 'text-cyan-400'
            }`}>
              <span>x₁ = {quadResult.x1}</span>
              {quadResult.x2 && <span>x₂ = {quadResult.x2}</span>}
            </div>

            {/* Step by step */}
            <div className={`pt-2 border-t text-[11px] font-mono space-y-0.5 ${
              theme.isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
            }`}>
              {quadResult.steps.map((st, i) => (
                <div key={i}>• {st}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() =>
                handleRecord(
                  `${quadA}x² + ${quadB}x + ${quadC} = 0`,
                  `x₁ = ${quadResult.x1}, x₂ = ${quadResult.x2 || '-'}`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                theme.isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />}
              <span>{copied ? 'Tersimpan' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Submode 3: LINEAR 2-VAR (SPLDV) */}
      {subMode === 'linear' && (
        <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
            theme.isLight ? 'text-emerald-700' : 'text-emerald-400'
          }`}>
            <Scale className="w-4 h-4" /> Sistem Persamaan Linear 2 Variabel (SPLDV)
          </h4>

          {/* Equation 1 */}
          <div className={`flex items-center gap-1.5 text-xs font-mono ${theme.isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            <input
              type="number"
              value={linA1}
              onChange={(e) => setLinA1(e.target.value)}
              className={`w-14 py-1.5 px-2 rounded-lg font-mono text-center border focus:outline-none ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
            <span>x +</span>
            <input
              type="number"
              value={linB1}
              onChange={(e) => setLinB1(e.target.value)}
              className={`w-14 py-1.5 px-2 rounded-lg font-mono text-center border focus:outline-none ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
            <span>y =</span>
            <input
              type="number"
              value={linC1}
              onChange={(e) => setLinC1(e.target.value)}
              className={`w-16 py-1.5 px-2 rounded-lg font-mono text-center border focus:outline-none ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Equation 2 */}
          <div className={`flex items-center gap-1.5 text-xs font-mono ${theme.isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            <input
              type="number"
              value={linA2}
              onChange={(e) => setLinA2(e.target.value)}
              className={`w-14 py-1.5 px-2 rounded-lg font-mono text-center border focus:outline-none ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
            <span>x +</span>
            <input
              type="number"
              value={linB2}
              onChange={(e) => setLinB2(e.target.value)}
              className={`w-14 py-1.5 px-2 rounded-lg font-mono text-center border focus:outline-none ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
            <span>y =</span>
            <input
              type="number"
              value={linC2}
              onChange={(e) => setLinC2(e.target.value)}
              className={`w-16 py-1.5 px-2 rounded-lg font-mono text-center border focus:outline-none ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Results */}
          <div className={`p-3 rounded-xl border space-y-1.5 ${
            theme.isLight ? 'bg-white/95 border-emerald-200 shadow-xs' : 'bg-slate-950/90 border-emerald-500/40'
          }`}>
            <div className={`text-base font-extrabold font-mono ${
              theme.isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}>
              {linResult.status === 'unique' ? (
                <span>x = {linResult.x.toFixed(4)}, y = {linResult.y.toFixed(4)}</span>
              ) : linResult.status === 'infinite' ? (
                <span>Tak Terhingga Solusi</span>
              ) : (
                <span>Tidak Ada Solusi</span>
              )}
            </div>

            <div className={`pt-2 border-t text-[11px] font-mono space-y-0.5 ${
              theme.isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
            }`}>
              {linResult.steps.map((st, i) => (
                <div key={i}>• {st}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() =>
                handleRecord(
                  `SPLDV: [${linA1}x + ${linB1}y = ${linC1}] & [${linA2}x + ${linB2}y = ${linC2}]`,
                  linResult.status === 'unique'
                    ? `x = ${linResult.x.toFixed(4)}, y = ${linResult.y.toFixed(4)}`
                    : linResult.status === 'infinite'
                    ? 'Tak Terhingga Solusi'
                    : 'Tidak Ada Solusi'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                theme.isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />}
              <span>{copied ? 'Tersimpan' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Submode 4: BMI & HEALTH */}
      {subMode === 'bmi' && (
        <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
            theme.isLight ? 'text-amber-700' : 'text-amber-400'
          }`}>
            <Sparkles className="w-4 h-4" /> Kalkulator Indeks Massa Tubuh (BMI) & Kalori BMR
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Berat (kg)</label>
              <input
                type="number"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Tinggi (cm)</label>
              <input
                type="number"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Usia (Tahun)</label>
              <input
                type="number"
                value={bmiAge}
                onChange={(e) => setBmiAge(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Kelamin</label>
              <select
                value={bmiGender}
                onChange={(e) => setBmiGender(e.target.value as 'male' | 'female')}
                className={`w-full py-2 px-2 rounded-xl text-xs border focus:outline-none transition-colors ${
                  theme.isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="male" className={theme.isLight ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}>Pria</option>
                <option value="female" className={theme.isLight ? 'text-slate-900 bg-white' : 'text-white bg-slate-900'}>Wanita</option>
              </select>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 ${
            theme.isLight ? 'bg-white/95 border-amber-200 shadow-xs' : 'bg-slate-950/90 border-amber-500/40'
          }`}>
            <div>
              <span className={`text-[10px] uppercase font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>Skor BMI</span>
              <div className={`text-2xl font-extrabold font-mono ${bmiResult.categoryColor}`}>
                {bmiResult.bmi.toFixed(1)}
              </div>
              <span className={`text-xs font-bold ${bmiResult.categoryColor}`}>
                {bmiResult.category}
              </span>
            </div>

            <div className="text-right text-xs space-y-1">
              <div className={theme.isLight ? 'text-slate-700' : 'text-slate-300'}>
                Berat Ideal: <strong className={theme.isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'}>{bmiResult.idealWeightRange.min.toFixed(1)} - {bmiResult.idealWeightRange.max.toFixed(1)} kg</strong>
              </div>
              <div className={theme.isLight ? 'text-slate-600' : 'text-slate-400'}>
                Kebutuhan BMR: <strong className={theme.isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{Math.round(bmiResult.bmr)} kkal / hari</strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() =>
                handleRecord(
                  `BMI (${bmiWeight}kg, ${bmiHeight}cm, ${bmiAge}thn)`,
                  `BMI: ${bmiResult.bmi.toFixed(1)} (${bmiResult.category}), BMR: ${Math.round(bmiResult.bmr)} kkal`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                theme.isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${theme.isLight ? 'text-amber-700' : 'text-amber-400'}`} />}
              <span>{copied ? 'Tersimpan' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Submode 5: AGE & DATE DIFFERENCE */}
      {subMode === 'date' && ageResult && (
        <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
            theme.isLight ? 'text-rose-700' : 'text-pink-400'
          }`}>
            <Calendar className="w-4 h-4" /> Kalkulator Usia Eksak & Tanggal Lahir
          </h4>

          <div className="flex flex-col gap-1">
            <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>Pilih Tanggal Lahir Anda</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                theme.isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-pink-400'
              }`}
            />
          </div>

          <div className={`p-3 rounded-xl border space-y-2 ${
            theme.isLight ? 'bg-white/95 border-rose-200 shadow-xs' : 'bg-slate-950/90 border-pink-500/40'
          }`}>
            <div>
              <span className={`text-[10px] uppercase font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>Usia Anda Saat Ini</span>
              <div className={`text-xl font-extrabold font-mono ${theme.isLight ? 'text-rose-700' : 'text-pink-400'}`}>
                {ageResult.years} Tahun, {ageResult.months} Bulan, {ageResult.days} Hari
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-2 pt-2 border-t text-xs font-mono ${
              theme.isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'
            }`}>
              <div>• Hari Lahir: <strong className={theme.isLight ? 'text-slate-900' : 'text-white'}>{ageResult.birthDayOfWeek}</strong></div>
              <div>• Zodiak: <strong className={theme.isLight ? 'text-sky-700' : 'text-cyan-400'}>{ageResult.zodiac}</strong></div>
              <div>• Total Hari Hidup: <strong className={theme.isLight ? 'text-amber-700' : 'text-amber-400'}>{ageResult.totalDays.toLocaleString('id-ID')} hari</strong></div>
              <div>• Ultah Berikutnya: <strong className={theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}>{ageResult.nextBirthdayDays} hari lagi</strong></div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() =>
                handleRecord(
                  `Kalkulator Usia (Lahir: ${birthDate})`,
                  `${ageResult.years} thn ${ageResult.months} bln ${ageResult.days} hr (${ageResult.zodiac}, ${ageResult.totalDays} hari hidup)`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                theme.isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${theme.isLight ? 'text-rose-700' : 'text-pink-400'}`} />}
              <span>{copied ? 'Tersimpan' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
