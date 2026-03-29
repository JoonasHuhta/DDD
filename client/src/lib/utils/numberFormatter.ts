// Advanced number formatting for large numbers in incremental games

export const NUMBER_SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UnDc', 'DuDc', 'TrDc', 'QaDc',
  'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg', 'UnVg', 'DuVg', 'TrVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg',
  'OcVg', 'NoVg', 'Tg', 'UnTg', 'DuTg', 'TrTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OcTg', 'NoTg',
  'Qag', 'UnQag', 'DuQag', 'TrQag', 'QaQag', 'QiQag', 'SxQag', 'SpQag', 'OcQag', 'NoQag'
];

export function formatLargeNumber(num: number, precision: number = 3): string {
  if (num === 0) return '0';
  if (num < 0) return '-' + formatLargeNumber(-num, precision);
  
  // Handle very large numbers with scientific notation
  if (num >= 1e308) {
    return num.toExponential(2);
  }
  
  // For numbers less than 1000, show as is
  if (num < 1000) {
    return Math.floor(num).toString();
  }
  
  // Calculate suffix index
  const suffixIndex = Math.floor(Math.log10(num) / 3);
  
  if (suffixIndex < NUMBER_SUFFIXES.length) {
    const scaledNumber = num / Math.pow(1000, suffixIndex);
    const suffix = NUMBER_SUFFIXES[suffixIndex];
    
    // Format with appropriate precision
    if (scaledNumber >= 100) {
      return Math.floor(scaledNumber).toString() + suffix;
    } else if (scaledNumber >= 10) {
      return scaledNumber.toFixed(1) + suffix;
    } else {
      return scaledNumber.toFixed(2) + suffix;
    }
  }
  
  // Fallback to scientific notation for extremely large numbers
  return num.toExponential(precision - 1);
}

export function formatCurrency(num: number, precision?: number): string {
  return '$' + formatLargeNumber(num, precision);
}

export function formatPerSecond(num: number): string {
  return formatLargeNumber(num) + '/s';
}

// Compare two large numbers safely
export function compareLargeNumbers(a: number, b: number): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Calculate percentage safely for large numbers
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, (part / total) * 100);
}

// Format milliseconds as mm:ss or hh:mm:ss
export function formatTimeMs(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}