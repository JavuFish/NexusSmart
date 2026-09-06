import { UnitCategory } from '../types';

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Panjang (Length)',
    icon: 'Ruler',
    units: [
      { id: 'km', name: 'Kilometer', symbol: 'km', ratioToBase: 1000 },
      { id: 'm', name: 'Meter', symbol: 'm', ratioToBase: 1 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', ratioToBase: 0.01 },
      { id: 'mm', name: 'Milimeter', symbol: 'mm', ratioToBase: 0.001 },
      { id: 'mi', name: 'Mil (Mile)', symbol: 'mi', ratioToBase: 1609.344 },
      { id: 'yd', name: 'Yard', symbol: 'yd', ratioToBase: 0.9144 },
      { id: 'ft', name: 'Kaki (Feet)', symbol: 'ft', ratioToBase: 0.3048 },
      { id: 'in', name: 'Inci (Inch)', symbol: 'in', ratioToBase: 0.0254 },
      { id: 'nmi', name: 'Mil Laut (Nautical Mile)', symbol: 'NM', ratioToBase: 1852 },
    ],
  },
  {
    id: 'mass',
    name: 'Massa & Berat (Weight)',
    icon: 'Scale',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', ratioToBase: 1 },
      { id: 'g', name: 'Gram', symbol: 'g', ratioToBase: 0.001 },
      { id: 'mg', name: 'Miligram', symbol: 'mg', ratioToBase: 0.000001 },
      { id: 'ton', name: 'Metrik Ton', symbol: 't', ratioToBase: 1000 },
      { id: 'lb', name: 'Pound', symbol: 'lbs', ratioToBase: 0.45359237 },
      { id: 'oz', name: 'Ounce (Ons)', symbol: 'oz', ratioToBase: 0.0283495231 },
      { id: 'ct', name: 'Karat', symbol: 'ct', ratioToBase: 0.0002 },
    ],
  },
  {
    id: 'temp',
    name: 'Suhu (Temperature)',
    icon: 'Thermometer',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', ratioToBase: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', ratioToBase: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', ratioToBase: 1 },
      { id: 'r', name: 'Rankine', symbol: '°R', ratioToBase: 1 },
    ],
  },
  {
    id: 'data',
    name: 'Data Digital (Storage)',
    icon: 'HardDrive',
    units: [
      { id: 'b', name: 'Byte', symbol: 'B', ratioToBase: 1 },
      { id: 'kb', name: 'Kilobyte', symbol: 'KB', ratioToBase: 1024 },
      { id: 'mb', name: 'Megabyte', symbol: 'MB', ratioToBase: 1024 * 1024 },
      { id: 'gb', name: 'Gigabyte', symbol: 'GB', ratioToBase: 1024 * 1024 * 1024 },
      { id: 'tb', name: 'Terabyte', symbol: 'TB', ratioToBase: 1024 * 1024 * 1024 * 1024 },
      { id: 'pb', name: 'Petabyte', symbol: 'PB', ratioToBase: 1024 * 1024 * 1024 * 1024 * 1024 },
      { id: 'bit', name: 'Bit', symbol: 'bit', ratioToBase: 0.125 },
    ],
  },
  {
    id: 'speed',
    name: 'Kecepatan (Speed)',
    icon: 'Gauge',
    units: [
      { id: 'kmh', name: 'Km/Jam', symbol: 'km/h', ratioToBase: 1 },
      { id: 'ms', name: 'Meter/Detik', symbol: 'm/s', ratioToBase: 3.6 },
      { id: 'mph', name: 'Mil/Jam (mph)', symbol: 'mph', ratioToBase: 1.60934 },
      { id: 'knot', name: 'Knot', symbol: 'kn', ratioToBase: 1.852 },
      { id: 'mach', name: 'Mach (Suara)', symbol: 'Ma', ratioToBase: 1225.044 },
    ],
  },
  {
    id: 'area',
    name: 'Luas (Area)',
    icon: 'Grid',
    units: [
      { id: 'sqm', name: 'Meter Persegi', symbol: 'm²', ratioToBase: 1 },
      { id: 'sqkm', name: 'Kilometer Persegi', symbol: 'km²', ratioToBase: 1e6 },
      { id: 'sqcm', name: 'Centimeter Persegi', symbol: 'cm²', ratioToBase: 0.0001 },
      { id: 'ha', name: 'Hektar (Hectare)', symbol: 'ha', ratioToBase: 10000 },
      { id: 'acre', name: 'Acre (Ekar)', symbol: 'ac', ratioToBase: 4046.86 },
      { id: 'sqft', name: 'Kaki Persegi', symbol: 'ft²', ratioToBase: 0.092903 },
      { id: 'sqin', name: 'Inci Persegi', symbol: 'in²', ratioToBase: 0.00064516 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume & Kapasitas',
    icon: 'Box',
    units: [
      { id: 'l', name: 'Liter', symbol: 'L', ratioToBase: 1 },
      { id: 'ml', name: 'Mililiter', symbol: 'mL', ratioToBase: 0.001 },
      { id: 'cum', name: 'Meter Kubik', symbol: 'm³', ratioToBase: 1000 },
      { id: 'gal_us', name: 'Galon US', symbol: 'gal', ratioToBase: 3.78541 },
      { id: 'qt_us', name: 'Quart US', symbol: 'qt', ratioToBase: 0.946353 },
      { id: 'pt_us', name: 'Pint US', symbol: 'pt', ratioToBase: 0.473176 },
      { id: 'cup', name: 'Cangkir (Cup)', symbol: 'cup', ratioToBase: 0.24 },
      { id: 'floz', name: 'Fluid Ounce', symbol: 'fl oz', ratioToBase: 0.0295735 },
    ],
  },
  {
    id: 'time',
    name: 'Waktu (Time)',
    icon: 'Clock',
    units: [
      { id: 's', name: 'Detik (Second)', symbol: 's', ratioToBase: 1 },
      { id: 'ms', name: 'Milidetik', symbol: 'ms', ratioToBase: 0.001 },
      { id: 'min', name: 'Menit', symbol: 'min', ratioToBase: 60 },
      { id: 'h', name: 'Jam (Hour)', symbol: 'jam', ratioToBase: 3600 },
      { id: 'd', name: 'Hari (Day)', symbol: 'hari', ratioToBase: 86400 },
      { id: 'w', name: 'Minggu (Week)', symbol: 'minggu', ratioToBase: 604800 },
      { id: 'mo', name: 'Bulan (Avg)', symbol: 'bln', ratioToBase: 2629746 },
      { id: 'yr', name: 'Tahun (Year)', symbol: 'thn', ratioToBase: 31556952 },
    ],
  },
  {
    id: 'pressure',
    name: 'Tekanan (Pressure)',
    icon: 'Activity',
    units: [
      { id: 'pa', name: 'Pascal', symbol: 'Pa', ratioToBase: 1 },
      { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', ratioToBase: 1000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', ratioToBase: 100000 },
      { id: 'psi', name: 'PSI (lb/in²)', symbol: 'psi', ratioToBase: 6894.76 },
      { id: 'atm', name: 'Atmosfer Standar', symbol: 'atm', ratioToBase: 101325 },
      { id: 'mmhg', name: 'Milimeter Merkuri', symbol: 'mmHg', ratioToBase: 133.322 },
    ],
  },
];

export function convertUnit(
  val: number,
  fromUnitId: string,
  toUnitId: string,
  categoryId: string
): number {
  if (isNaN(val)) return 0;
  if (fromUnitId === toUnitId) return val;

  // Temperature special conversion
  if (categoryId === 'temp') {
    // Convert fromUnit to Celsius first
    let celsius = 0;
    if (fromUnitId === 'c') celsius = val;
    else if (fromUnitId === 'f') celsius = (val - 32) * (5 / 9);
    else if (fromUnitId === 'k') celsius = val - 273.15;
    else if (fromUnitId === 'r') celsius = (val - 491.67) * (5 / 9);

    // Convert Celsius to toUnit
    if (toUnitId === 'c') return celsius;
    if (toUnitId === 'f') return celsius * (9 / 5) + 32;
    if (toUnitId === 'k') return celsius + 273.15;
    if (toUnitId === 'r') return (celsius + 273.15) * (9 / 5);
    return celsius;
  }

  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return val;

  const fromUnit = category.units.find((u) => u.id === fromUnitId);
  const toUnit = category.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return val;

  // Base value in base unit
  const baseValue = val * fromUnit.ratioToBase;
  // Convert to target unit
  return baseValue / toUnit.ratioToBase;
}
