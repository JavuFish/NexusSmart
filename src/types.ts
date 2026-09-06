export type CalculatorMode = 
  | 'scientific'
  | 'programmer'
  | 'converter'
  | 'finance'
  | 'solver';

export type ThemeId = 
  // 5 New Modern, Clean, Soft Color Themes:
  | 'nordic'
  | 'matcha'
  | 'lavender'
  | 'oat'
  | 'sky'
  // Existing Futuristic Themes:
  | 'cyberpunk'
  | 'matrix'
  | 'solar'
  | 'hyperfrost'
  | 'nebula';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  badge: string;
  category: 'soft' | 'futuristic';
  fontFamily: string; // e.g. 'font-outfit', 'font-dmsans', 'font-figtree', 'font-lexend', 'font-manrope', 'font-jakarta'
  fontName: string; // e.g. 'Outfit'
  fontDesc: string; // e.g. 'Scandinavian Minimalist Geometric'
  isLight: boolean;
  bgMain: string;
  cardBg: string;
  cardBorder: string;
  displayBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textTitle: string; // High-contrast title & key headings
  textSub: string;   // Secondary label tone
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  btnDefault: string;
  btnDefaultHover: string;
  btnOperator: string;
  btnOperatorHover: string;
  btnAction: string;
  btnActionHover: string;
  btnEqual: string;
  btnEqualHover: string;
  activeTab: string;
  inactiveTab: string;
  glowEffect: string;
  neonBorder: string;
  previewColors: [string, string, string];
  pillTagBg: string;
  inputBg: string;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  mode: string;
  note?: string;
}

export type AngleUnit = 'DEG' | 'RAD';

export type BitWordSize = 'QWORD' | 'DWORD' | 'WORD' | 'BYTE';

export interface UnitCategory {
  id: string;
  name: string;
  icon: string;
  units: {
    id: string;
    name: string;
    symbol: string;
    ratioToBase: number; // For linear conversion: base = value * ratio
    offset?: number;    // For temperature: base = (value + offset) * ratio etc.
  }[];
}

export type FinanceSubMode = 'loan' | 'compound' | 'discount' | 'split_bill';

export type SolverSubMode = 'graph' | 'quadratic' | 'linear' | 'bmi' | 'date';
