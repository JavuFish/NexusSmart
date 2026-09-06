export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: {
    period: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

export function calculateLoan(
  principal: number,
  annualInterestRate: number, // in percent e.g. 8.5
  tenureYears: number
): LoanResult {
  const p = Math.max(0, principal);
  const r = Math.max(0, annualInterestRate) / 100 / 12;
  const n = Math.max(1, Math.round(tenureYears * 12));

  if (p === 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  }

  let monthlyPayment = 0;
  if (r === 0) {
    monthlyPayment = p / n;
  } else {
    monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - p;

  // Generate monthly amortization schedule (sample 12 months preview or yearly)
  const schedule = [];
  let balance = p;
  const previewLimit = Math.min(n, 24);

  for (let i = 1; i <= previewLimit; i++) {
    const interestPart = balance * r;
    const principalPart = monthlyPayment - interestPart;
    balance = Math.max(0, balance - principalPart);
    schedule.push({
      period: i,
      payment: monthlyPayment,
      principal: principalPart,
      interest: interestPart,
      balance: balance,
    });
  }

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    schedule,
  };
}

export interface CompoundResult {
  futureValue: number;
  totalDeposits: number;
  totalInterest: number;
  yearlyBreakdown: {
    year: number;
    deposits: number;
    interest: number;
    total: number;
  }[];
}

export function calculateCompoundInterest(
  initialDeposit: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
  compoundFrequency = 12 // times per year
): CompoundResult {
  const p0 = Math.max(0, initialDeposit);
  const pM = Math.max(0, monthlyContribution);
  const r = Math.max(0, annualRate) / 100;
  const t = Math.max(1, Math.min(50, Math.round(years)));

  let balance = p0;
  let totalDeposits = p0;
  const yearlyBreakdown = [];

  for (let y = 1; y <= t; y++) {
    for (let m = 1; m <= 12; m++) {
      balance += pM;
      totalDeposits += pM;
      // Monthly compound interest
      balance += balance * (r / compoundFrequency);
    }
    yearlyBreakdown.push({
      year: y,
      deposits: totalDeposits,
      interest: balance - totalDeposits,
      total: balance,
    });
  }

  return {
    futureValue: balance,
    totalDeposits,
    totalInterest: balance - totalDeposits,
    yearlyBreakdown,
  };
}

export function calculateDiscountTax(
  originalPrice: number,
  discountPercent: number,
  taxPercent: number
): { discountedPrice: number; taxAmount: number; finalPrice: number; totalSaved: number } {
  const original = Math.max(0, originalPrice);
  const discPct = Math.max(0, Math.min(100, discountPercent));
  const taxPct = Math.max(0, taxPercent);

  const discountAmount = (original * discPct) / 100;
  const discountedPrice = original - discountAmount;
  const taxAmount = (discountedPrice * taxPct) / 100;
  const finalPrice = discountedPrice + taxAmount;
  const totalSaved = discountAmount;

  return {
    discountedPrice,
    taxAmount,
    finalPrice,
    totalSaved,
  };
}

export function calculateSplitBill(
  billAmount: number,
  tipPercent: number,
  peopleCount: number
): { tipAmount: number; totalWithTip: number; perPerson: number; tipPerPerson: number } {
  const bill = Math.max(0, billAmount);
  const tipPct = Math.max(0, tipPercent);
  const people = Math.max(1, Math.round(peopleCount));

  const tipAmount = (bill * tipPct) / 100;
  const totalWithTip = bill + tipAmount;
  const perPerson = totalWithTip / people;
  const tipPerPerson = tipAmount / people;

  return {
    tipAmount,
    totalWithTip,
    perPerson,
    tipPerPerson,
  };
}
