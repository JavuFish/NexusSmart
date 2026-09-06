import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  TrendingUp,
  Percent,
  Users,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';
import { CalculationHistoryItem, FinanceSubMode, ThemeConfig } from '../types';
import {
  calculateCompoundInterest,
  calculateDiscountTax,
  calculateLoan,
  calculateSplitBill,
} from '../utils/financial';
import { playFuturisticSound } from '../utils/audio';

interface FinanceModeProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
  onAddHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const FinanceMode: React.FC<FinanceModeProps> = ({
  theme,
  soundEnabled,
  onAddHistory,
}) => {
  const [subMode, setSubMode] = useState<FinanceSubMode>('loan');
  const [copied, setCopied] = useState<boolean>(false);

  // Loan states
  const [loanPrincipal, setLoanPrincipal] = useState<string>('100000000'); // 100jt
  const [loanRate, setLoanRate] = useState<string>('8.5'); // 8.5%
  const [loanYears, setLoanYears] = useState<string>('5'); // 5 years

  // Compound states
  const [compInitial, setCompInitial] = useState<string>('10000000'); // 10jt
  const [compMonthly, setCompMonthly] = useState<string>('1000000'); // 1jt/mo
  const [compRate, setCompRate] = useState<string>('10'); // 10%
  const [compYears, setCompYears] = useState<string>('10'); // 10 years

  // Discount & Tax states
  const [discPrice, setDiscPrice] = useState<string>('500000');
  const [discPercent, setDiscPercent] = useState<string>('20');
  const [taxPercent, setTaxPercent] = useState<string>('11'); // 11% PPN

  // Split bill states
  const [billAmount, setBillAmount] = useState<string>('450000');
  const [tipPercent, setTipPercent] = useState<string>('10');
  const [peopleCount, setPeopleCount] = useState<string>('4');

  // Currency formatter
  const formatCurrency = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  // Loan calculation memo
  const loanData = useMemo(() => {
    return calculateLoan(
      parseFloat(loanPrincipal) || 0,
      parseFloat(loanRate) || 0,
      parseFloat(loanYears) || 0
    );
  }, [loanPrincipal, loanRate, loanYears]);

  // Compound calculation memo
  const compoundData = useMemo(() => {
    return calculateCompoundInterest(
      parseFloat(compInitial) || 0,
      parseFloat(compMonthly) || 0,
      parseFloat(compRate) || 0,
      parseFloat(compYears) || 0
    );
  }, [compInitial, compMonthly, compRate, compYears]);

  // Discount calculation memo
  const discountData = useMemo(() => {
    return calculateDiscountTax(
      parseFloat(discPrice) || 0,
      parseFloat(discPercent) || 0,
      parseFloat(taxPercent) || 0
    );
  }, [discPrice, discPercent, taxPercent]);

  // Split bill calculation memo
  const splitData = useMemo(() => {
    return calculateSplitBill(
      parseFloat(billAmount) || 0,
      parseFloat(tipPercent) || 0,
      parseFloat(peopleCount) || 1
    );
  }, [billAmount, tipPercent, peopleCount]);

  const handleRecordHistory = (summaryExpr: string, resultStr: string) => {
    playFuturisticSound('action', soundEnabled);
    onAddHistory({
      expression: summaryExpr,
      result: resultStr,
      mode: 'finansial',
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Sub Mode Selector Tabs */}
      <div className={`grid grid-cols-4 gap-1.5 p-1 rounded-xl border ${
        theme.isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        {[
          { id: 'loan', label: 'KPR / Pinjaman', icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'compound', label: 'Investasi', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'discount', label: 'Diskon & PPN', icon: <Percent className="w-3.5 h-3.5" /> },
          { id: 'split_bill', label: 'Bagi Tagihan', icon: <Users className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = subMode === tab.id;
          return (
            <button
              key={tab.id}
              id={`finance-tab-${tab.id}`}
              onClick={() => {
                playFuturisticSound('switch', soundEnabled);
                setSubMode(tab.id as FinanceSubMode);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
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

      {/* Mode 1: LOAN & KPR CALCULATOR */}
      {subMode === 'loan' && (
        <div className="flex flex-col gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
              theme.isLight ? 'text-sky-700' : 'text-cyan-400'
            }`}>
              <CreditCard className="w-4 h-4" /> Kalkulator Cicilan Pinjaman / KPR
            </h4>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Pokok Pinjaman (Rp)</label>
                <input
                  type="number"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Suku Bunga (% / Thn)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Tenor (Tahun)</label>
                <input
                  type="number"
                  value={loanYears}
                  onChange={(e) => setLoanYears(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                  }`}
                />
              </div>
            </div>

            {/* Primary Result Banner */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 ${
              theme.isLight ? 'bg-white/95 border-sky-200 shadow-xs' : 'bg-slate-950/90 border-cyan-500/40'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>Angsuran Bulanan</span>
                <div className={`text-xl font-extrabold font-mono ${theme.textPrimary}`}>
                  {formatCurrency(loanData.monthlyPayment)} / bln
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <div className={`font-mono ${theme.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Total Bayar: <span className={`font-bold ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(loanData.totalPayment)}</span>
                </div>
                <div className={`font-mono ${theme.isLight ? 'text-pink-700' : 'text-pink-400'}`}>
                  Total Bunga: <span className="font-bold">{formatCurrency(loanData.totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* Action record */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  handleRecordHistory(
                    `Pinjaman ${formatCurrency(parseFloat(loanPrincipal) || 0)} (${loanYears} Thn @ ${loanRate}%)`,
                    `Cicilan: ${formatCurrency(loanData.monthlyPayment)}/bln`
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

          {/* Schedule Table Preview */}
          {loanData.schedule.length > 0 && (
            <div className={`p-3 rounded-xl border ${theme.isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'}`}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${theme.isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                <Calendar className={`w-3.5 h-3.5 ${theme.isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
                <span>Simulasi Jadwal Amortisasi (12 Bulan Pertama)</span>
              </div>
              <div className="max-h-36 overflow-y-auto font-mono text-[10px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`border-b ${theme.isLight ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-slate-800'}`}>
                      <th className="py-1">Bulan</th>
                      <th className="py-1">Pokok</th>
                      <th className="py-1">Bunga</th>
                      <th className="py-1">Sisa Pokok</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.isLight ? 'divide-slate-200/70 text-slate-700' : 'divide-slate-800/40 text-slate-300'}`}>
                    {loanData.schedule.slice(0, 12).map((row) => (
                      <tr key={row.period}>
                        <td className={`py-1 font-bold ${theme.isLight ? 'text-sky-700' : 'text-cyan-400'}`}>#{row.period}</td>
                        <td className="py-1">{formatCurrency(row.principal)}</td>
                        <td className={`py-1 ${theme.isLight ? 'text-rose-700 font-medium' : 'text-pink-400'}`}>{formatCurrency(row.interest)}</td>
                        <td className={`py-1 ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: COMPOUND INTEREST */}
      {subMode === 'compound' && (
        <div className="flex flex-col gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
              theme.isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}>
              <TrendingUp className="w-4 h-4" /> Simulasi Investasi & Bunga Majemuk
            </h4>

            {/* Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Modal Awal (Rp)</label>
                <input
                  type="number"
                  value={compInitial}
                  onChange={(e) => setCompInitial(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Setoran / Bln (Rp)</label>
                <input
                  type="number"
                  value={compMonthly}
                  onChange={(e) => setCompMonthly(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Return (% / Thn)</label>
                <input
                  type="number"
                  step="0.5"
                  value={compRate}
                  onChange={(e) => setCompRate(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Durasi (Tahun)</label>
                <input
                  type="number"
                  value={compYears}
                  onChange={(e) => setCompYears(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-400'
                  }`}
                />
              </div>
            </div>

            {/* Results Banner */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 ${
              theme.isLight ? 'bg-white/95 border-emerald-200 shadow-xs' : 'bg-slate-950/90 border-emerald-500/40'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>Estimasi Nilai Akhir (Future Value)</span>
                <div className={`text-xl font-extrabold font-mono ${theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  {formatCurrency(compoundData.futureValue)}
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <div className={`font-mono ${theme.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Total Setoran: <span className={`font-bold ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(compoundData.totalDeposits)}</span>
                </div>
                <div className={`font-mono ${theme.isLight ? 'text-emerald-700' : 'text-lime-300'}`}>
                  Bunga / Keuntungan: <span className="font-bold">+{formatCurrency(compoundData.totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  handleRecordHistory(
                    `Investasi ${compYears} Thn @ ${compRate}%`,
                    `Saldo Akhir: ${formatCurrency(compoundData.futureValue)}`
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
        </div>
      )}

      {/* Mode 3: DISCOUNT & TAX / PPN */}
      {subMode === 'discount' && (
        <div className="flex flex-col gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
              theme.isLight ? 'text-amber-700' : 'text-amber-400'
            }`}>
              <Percent className="w-4 h-4" /> Hitung Diskon & Pajak PPN
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Harga Asli (Rp)</label>
                <input
                  type="number"
                  value={discPrice}
                  onChange={(e) => setDiscPrice(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Diskon (%)</label>
                <input
                  type="number"
                  value={discPercent}
                  onChange={(e) => setDiscPercent(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Pajak / PPN (%)</label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>
            </div>

            {/* Results Banner */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 ${
              theme.isLight ? 'bg-white/95 border-amber-200 shadow-xs' : 'bg-slate-950/90 border-amber-500/40'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Akhir Bayar</span>
                <div className={`text-xl font-extrabold font-mono ${theme.isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                  {formatCurrency(discountData.finalPrice)}
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <div className={`font-mono ${theme.isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  Hemat Diskon: <span className="font-bold">-{formatCurrency(discountData.totalSaved)}</span>
                </div>
                <div className={`font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Pajak ({taxPercent}%): <span className={`font-bold ${theme.isLight ? 'text-slate-800' : 'text-slate-300'}`}>+{formatCurrency(discountData.taxAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  handleRecordHistory(
                    `Harga ${formatCurrency(parseFloat(discPrice) || 0)} (Diskon ${discPercent}%, Pajak ${taxPercent}%)`,
                    `Total: ${formatCurrency(discountData.finalPrice)} (Hemat ${formatCurrency(discountData.totalSaved)})`
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
        </div>
      )}

      {/* Mode 4: SPLIT BILL & TIP */}
      {subMode === 'split_bill' && (
        <div className="flex flex-col gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${theme.displayBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono ${
              theme.isLight ? 'text-rose-700' : 'text-pink-400'
            }`}>
              <Users className="w-4 h-4" /> Bagi Tagihan (Split Bill & Tip)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Total Tagihan (Rp)</label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-pink-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Tip Pelayan (%)</label>
                <input
                  type="number"
                  value={tipPercent}
                  onChange={(e) => setTipPercent(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-pink-400'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] ${theme.isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>Jumlah Orang</label>
                <input
                  type="number"
                  min="1"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl font-mono text-sm border focus:outline-none transition-colors ${
                    theme.isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-inner'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-pink-400'
                  }`}
                />
              </div>
            </div>

            {/* Results Banner */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 ${
              theme.isLight ? 'bg-white/95 border-rose-200 shadow-xs' : 'bg-slate-950/90 border-pink-500/40'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-mono ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>Bayar Per Orang</span>
                <div className={`text-xl font-extrabold font-mono ${theme.isLight ? 'text-rose-700' : 'text-pink-400'}`}>
                  {formatCurrency(splitData.perPerson)} / org
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5">
                <div className={`font-mono ${theme.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Total + Tip: <span className={`font-bold ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(splitData.totalWithTip)}</span>
                </div>
                <div className={`font-mono ${theme.isLight ? 'text-rose-600' : 'text-pink-300'}`}>
                  Tip Per Orang: <span className="font-bold">{formatCurrency(splitData.tipPerPerson)}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  handleRecordHistory(
                    `Bagi Tagihan ${formatCurrency(parseFloat(billAmount) || 0)} untuk ${peopleCount} org (+ Tip ${tipPercent}%)`,
                    `${formatCurrency(splitData.perPerson)} / orang`
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
        </div>
      )}
    </div>
  );
};
