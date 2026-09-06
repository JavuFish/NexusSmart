import { AngleUnit } from '../types';

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS precision limit for factorial
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

export function formatCalculationResult(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Floating point artifact cleaner
  const rounded = Math.round(num * 1e12) / 1e12;
  
  // If scientific notation is cleaner
  if (Math.abs(rounded) >= 1e15 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
    return rounded.toExponential(8).replace(/\.?0+e/, 'e');
  }

  // Format with thousand separators while preserving decimal precision
  const parts = rounded.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function evaluateExpression(expr: string, angleUnit: AngleUnit = 'DEG'): { result: number; error: string | null } {
  try {
    if (!expr || expr.trim() === '') {
      return { result: 0, error: null };
    }

    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?![a-zA-Z0-9_])/g, 'Math.E')
      .replace(/φ/g, '((1 + Math.sqrt(5)) / 2)');

    // Handle factorial n!
    sanitized = sanitized.replace(/(\d+(\.\d+)?|\([^)]+\))!/g, (_, p1) => {
      return `__fact(${p1})`;
    });

    // Handle sqrt √(x) or √(number)
    sanitized = sanitized.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
    sanitized = sanitized.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
    sanitized = sanitized.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');
    sanitized = sanitized.replace(/∛(\d+(\.\d+)?)/g, 'Math.cbrt($1)');

    // Handle powers ^
    sanitized = sanitized.replace(/\^/g, '**');

    // Handle percentages e.g. 50 + 10% -> handles % operator as /100
    sanitized = sanitized.replace(/%/g, '/100');

    // Trigonometric functions
    const degToRad = (val: number) => (angleUnit === 'DEG' ? (val * Math.PI) / 180 : val);
    const radToDeg = (val: number) => (angleUnit === 'DEG' ? (val * 180) / Math.PI : val);

    // Custom helper scope
    const helpers = {
      __fact: factorial,
      sin: (x: number) => Math.sin(degToRad(x)),
      cos: (x: number) => Math.cos(degToRad(x)),
      tan: (x: number) => {
        const rad = degToRad(x);
        // Avoid precision infinity issues
        if (Math.abs(Math.cos(rad)) < 1e-15) return NaN;
        return Math.tan(rad);
      },
      asin: (x: number) => radToDeg(Math.asin(x)),
      acos: (x: number) => radToDeg(Math.acos(x)),
      atan: (x: number) => radToDeg(Math.atan(x)),
      sinh: (x: number) => Math.sinh(x),
      cosh: (x: number) => Math.cosh(x),
      tanh: (x: number) => Math.tanh(x),
      log: (x: number) => Math.log10(x),
      ln: (x: number) => Math.log(x),
      abs: (x: number) => Math.abs(x),
      sqrt: (x: number) => Math.sqrt(x),
      cbrt: (x: number) => Math.cbrt(x),
      exp: (x: number) => Math.exp(x),
    };

    // Replace named functions with helper scope calls
    sanitized = sanitized
      .replace(/asin\(/g, 'helpers.asin(')
      .replace(/acos\(/g, 'helpers.acos(')
      .replace(/atan\(/g, 'helpers.atan(')
      .replace(/sinh\(/g, 'helpers.sinh(')
      .replace(/cosh\(/g, 'helpers.cosh(')
      .replace(/tanh\(/g, 'helpers.tanh(')
      .replace(/sin\(/g, 'helpers.sin(')
      .replace(/cos\(/g, 'helpers.cos(')
      .replace(/tan\(/g, 'helpers.tan(')
      .replace(/log\(/g, 'helpers.log(')
      .replace(/ln\(/g, 'helpers.ln(')
      .replace(/abs\(/g, 'helpers.abs(')
      .replace(/__fact\(/g, 'helpers.__fact(');

    // Function evaluator in isolated context
    const fn = new Function('helpers', `return (${sanitized});`);
    const val = fn(helpers);

    if (typeof val !== 'number' || isNaN(val)) {
      return { result: NaN, error: 'Format Kalkulasi Tidak Valid' };
    }

    return { result: val, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kalkulasi Gagal';
    return { result: NaN, error: msg };
  }
}
