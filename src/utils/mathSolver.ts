export interface QuadraticSolution {
  discriminant: number;
  rootType: 'two_real' | 'one_real' | 'complex';
  x1: string;
  x2: string;
  vertex: { x: number; y: number };
  steps: string[];
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticSolution {
  if (a === 0) {
    if (b === 0) {
      return {
        discriminant: 0,
        rootType: 'two_real',
        x1: c === 0 ? 'Semua nilai x' : 'Tidak ada solusi',
        x2: '',
        vertex: { x: 0, y: 0 },
        steps: ['Bukan persamaan kuadrat (a = 0 dan b = 0)'],
      };
    }
    const x = -c / b;
    return {
      discriminant: 0,
      rootType: 'one_real',
      x1: x.toFixed(4),
      x2: '',
      vertex: { x: 0, y: 0 },
      steps: [`Persamaan linear: ${b}x + ${c} = 0`, `x = -(${c}) / ${b} = ${x.toFixed(4)}`],
    };
  }

  const d = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  const steps: string[] = [
    `Bentuk umum: ${a}x² + (${b})x + (${c}) = 0`,
    `Hitung Diskriminan D = b² - 4ac:`,
    `D = (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${d}`,
  ];

  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    steps.push(`Karena D > 0, terdapat 2 akar real berbeda:`);
    steps.push(`x₁ = (-b + √D) / (2a) = (${-b} + ${sqrtD.toFixed(4)}) / ${2 * a} = ${x1.toFixed(4)}`);
    steps.push(`x₂ = (-b - √D) / (2a) = (${-b} - ${sqrtD.toFixed(4)}) / ${2 * a} = ${x2.toFixed(4)}`);
    return {
      discriminant: d,
      rootType: 'two_real',
      x1: x1.toFixed(4),
      x2: x2.toFixed(4),
      vertex: { x: vertexX, y: vertexY },
      steps,
    };
  } else if (d === 0) {
    const x = -b / (2 * a);
    steps.push(`Karena D = 0, terdapat 1 akar real kembar:`);
    steps.push(`x = -b / (2a) = ${-b} / ${2 * a} = ${x.toFixed(4)}`);
    return {
      discriminant: d,
      rootType: 'one_real',
      x1: x.toFixed(4),
      x2: x.toFixed(4),
      vertex: { x: vertexX, y: vertexY },
      steps,
    };
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-d) / (2 * a);
    const x1Str = `${realPart.toFixed(4)} + ${Math.abs(imagPart).toFixed(4)}i`;
    const x2Str = `${realPart.toFixed(4)} - ${Math.abs(imagPart).toFixed(4)}i`;
    steps.push(`Karena D < 0, akar berupa bilangan kompleks/imajiner:`);
    steps.push(`x₁ = ${x1Str}`);
    steps.push(`x₂ = ${x2Str}`);
    return {
      discriminant: d,
      rootType: 'complex',
      x1: x1Str,
      x2: x2Str,
      vertex: { x: vertexX, y: vertexY },
      steps,
    };
  }
}

export function solveLinearSystem(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): { x: number; y: number; status: 'unique' | 'infinite' | 'none'; steps: string[] } {
  // Determinant
  const det = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  const steps = [
    `Persamaan 1: ${a1}x + ${b1}y = ${c1}`,
    `Persamaan 2: ${a2}x + ${b2}y = ${c2}`,
    `Determinan Utama (D) = (${a1} * ${b2}) - (${a2} * ${b1}) = ${det}`,
  ];

  if (Math.abs(det) < 1e-12) {
    if (Math.abs(detX) < 1e-12 && Math.abs(detY) < 1e-12) {
      steps.push(`D = 0 dan Dx = Dy = 0 → Tak terhingga banyak solusi (garis berimpit)`);
      return { x: 0, y: 0, status: 'infinite', steps };
    }
    steps.push(`D = 0 namun Dx / Dy ≠ 0 → Tidak ada solusi (garis sejajar)`);
    return { x: 0, y: 0, status: 'none', steps };
  }

  const x = detX / det;
  const y = detY / det;

  steps.push(`Determinan X (Dx) = (${c1} * ${b2}) - (${c2} * ${b1}) = ${detX}`);
  steps.push(`Determinan Y (Dy) = (${a1} * ${c2}) - (${a2} * ${c1}) = ${detY}`);
  steps.push(`Solusi x = Dx / D = ${detX} / ${det} = ${x.toFixed(4)}`);
  steps.push(`Solusi y = Dy / D = ${detY} / ${det} = ${y.toFixed(4)}`);

  return { x, y, status: 'unique', steps };
}

export interface BmiResult {
  bmi: number;
  category: 'Kurus (Underweight)' | 'Normal / Ideal' | 'Kelebihan Berat (Overweight)' | 'Obesitas (Obese)';
  categoryColor: string;
  idealWeightRange: { min: number; max: number };
  bmr: number; // Basal Metabolic Rate
}

export function calculateBmi(
  weightKg: number,
  heightCm: number,
  ageYears = 25,
  gender: 'male' | 'female' = 'male'
): BmiResult {
  const hM = heightCm / 100;
  if (hM <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      category: 'Normal / Ideal',
      categoryColor: 'text-emerald-400',
      idealWeightRange: { min: 0, max: 0 },
      bmr: 0,
    };
  }

  const bmi = weightKg / (hM * hM);
  let category: BmiResult['category'] = 'Normal / Ideal';
  let categoryColor = 'text-emerald-400';

  if (bmi < 18.5) {
    category = 'Kurus (Underweight)';
    categoryColor = 'text-amber-400';
  } else if (bmi < 25) {
    category = 'Normal / Ideal';
    categoryColor = 'text-emerald-400';
  } else if (bmi < 30) {
    category = 'Kelebihan Berat (Overweight)';
    categoryColor = 'text-orange-400';
  } else {
    category = 'Obesitas (Obese)';
    categoryColor = 'text-red-400';
  }

  const minIdeal = 18.5 * (hM * hM);
  const maxIdeal = 24.9 * (hM * hM);

  // Harris-Benedict BMR equation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageYears;
  }

  return {
    bmi,
    category,
    categoryColor,
    idealWeightRange: { min: minIdeal, max: maxIdeal },
    bmr: Math.max(0, bmr),
  };
}

export interface AgeDateResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  nextBirthdayDays: number;
  birthDayOfWeek: string;
  zodiac: string;
}

export function calculateAgeDate(birthDateStr: string): AgeDateResult | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  const now = new Date();

  if (isNaN(birth.getTime())) return null;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));

  // Next birthday calculation
  let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < now) {
    nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const nextBirthdayDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const birthDayOfWeek = daysOfWeek[birth.getDay()];

  // Zodiac
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  let zodiac = 'Aries';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiac = 'Aries ♈';
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiac = 'Taurus ♉';
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiac = 'Gemini ♊';
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiac = 'Cancer ♋';
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiac = 'Leo ♌';
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiac = 'Virgo ♍';
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiac = 'Libra ♎';
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiac = 'Scorpio ♏';
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiac = 'Sagittarius ♐';
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiac = 'Capricorn ♑';
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiac = 'Aquarius ♒';
  else zodiac = 'Pisces ♓';

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays,
    totalHours,
    nextBirthdayDays,
    birthDayOfWeek,
    zodiac,
  };
}

export function evaluateFunctionY(funcStr: string, x: number): number {
  try {
    let sanitized = funcStr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e(?![a-zA-Z0-9_])/g, 'Math.E');

    // Handle implied multiplication like 2x, 3sin(x), x(x+1)
    sanitized = sanitized.replace(/(\d)(x)/g, '$1*$2');
    sanitized = sanitized.replace(/(x)(\d)/g, '$1*$2');
    sanitized = sanitized.replace(/(\d)(Math\.)/g, '$1*$2');
    sanitized = sanitized.replace(/(x)(Math\.)/g, '$1*$2');

    const fn = new Function('x', `return (${sanitized});`);
    const res = fn(x);
    return typeof res === 'number' && !isNaN(res) ? res : NaN;
  } catch {
    return NaN;
  }
}
