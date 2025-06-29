/**
 * Formats currency amounts with English suffixes (K, M, B, T) for large numbers
 * Maintains up to 4 decimal places for accuracy and shows suffixes only when amounts get larger
 */

export interface FormatOptions {
  symbol?: string;
  showDecimals?: boolean;
  forceDecimals?: boolean;
  minValueForSuffix?: number;
  maxDecimals?: number;
}

/**
 * Formats a number with English suffixes (K, M, B, T)
 * @param amount - The number to format
 * @param options - Formatting options
 * @returns Formatted string with appropriate suffix
 */
export function formatCurrency(amount: number, options: FormatOptions = {}): string {
  const {
    symbol = '$',
    showDecimals = true,
    forceDecimals = false,
    minValueForSuffix = 1000,
    maxDecimals = 4
  } = options;

  // Handle negative numbers
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  // If amount is less than the minimum threshold, show full number
  if (absoluteAmount < minValueForSuffix) {
    const formatted = showDecimals || forceDecimals 
      ? absoluteAmount.toLocaleString('en-US', { 
          minimumFractionDigits: forceDecimals ? 2 : 0,
          maximumFractionDigits: forceDecimals ? 2 : 2 
        })
      : absoluteAmount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    
    return `${isNegative ? '-' : ''}${symbol}${formatted}`;
  }

  // Define suffixes and their values
  const suffixes = [
    { value: 1e12, suffix: 'T' }, // Trillion
    { value: 1e9, suffix: 'B' },  // Billion
    { value: 1e6, suffix: 'M' },  // Million
    { value: 1e3, suffix: 'K' },  // Thousand
  ];

  // Find the appropriate suffix
  for (const { value, suffix } of suffixes) {
    if (absoluteAmount >= value) {
      const scaledAmount = absoluteAmount / value;
      
      // Determine decimal places based on the scaled amount for optimal readability
      let decimals = 0;
      if (showDecimals) {
        if (scaledAmount < 10) {
          // For amounts like 1.2345K, 9.9876M - show up to 4 decimals
          decimals = Math.min(maxDecimals, 4);
        } else if (scaledAmount < 100) {
          // For amounts like 12.345K, 99.876M - show up to 3 decimals
          decimals = Math.min(maxDecimals, 3);
        } else if (scaledAmount < 1000) {
          // For amounts like 123.45K, 999.87M - show up to 2 decimals
          decimals = Math.min(maxDecimals, 2);
        } else {
          // For amounts like 1234.5K - show up to 1 decimal
          decimals = Math.min(maxDecimals, 1);
        }
      }

      // Force specific decimals if requested
      if (forceDecimals) {
        decimals = 2;
      }

      // Remove trailing zeros for cleaner display
      const formattedAmount = parseFloat(scaledAmount.toFixed(decimals)).toLocaleString('en-US', {
        minimumFractionDigits: forceDecimals ? decimals : 0,
        maximumFractionDigits: decimals
      });

      return `${isNegative ? '-' : ''}${symbol}${formattedAmount}${suffix}`;
    }
  }

  // Fallback (should never reach here given our logic)
  const formatted = showDecimals || forceDecimals
    ? absoluteAmount.toLocaleString('en-US', { 
        minimumFractionDigits: forceDecimals ? 2 : 0,
        maximumFractionDigits: forceDecimals ? 2 : 2 
      })
    : absoluteAmount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Formats currency for display in different contexts
 */
export const CurrencyFormatter = {
  /**
   * Standard currency formatting with suffixes for amounts >= 1000
   * Shows up to 4 decimal places for precision
   */
  standard: (amount: number, symbol: string = '$'): string => {
    return formatCurrency(amount, { symbol, showDecimals: true, maxDecimals: 4 });
  },

  /**
   * Compact formatting - always shows suffixes when possible
   * Shows up to 3 decimal places for space efficiency
   */
  compact: (amount: number, symbol: string = '$'): string => {
    return formatCurrency(amount, { symbol, showDecimals: true, minValueForSuffix: 1000, maxDecimals: 3 });
  },

  /**
   * Detailed formatting - always shows 2 decimal places, no suffixes for smaller amounts
   * Uses suffixes only for very large amounts (10K+)
   */
  detailed: (amount: number, symbol: string = '$'): string => {
    return formatCurrency(amount, { symbol, forceDecimals: true, minValueForSuffix: 10000, maxDecimals: 4 });
  },

  /**
   * Input formatting - for form inputs, always shows full number with decimals
   */
  input: (amount: number, symbol: string = '$'): string => {
    return formatCurrency(amount, { symbol, forceDecimals: true, minValueForSuffix: Infinity });
  },

  /**
   * Analytics formatting - optimized for charts and analytics
   * Shows up to 4 decimal places for maximum precision
   */
  analytics: (amount: number, symbol: string = '$'): string => {
    return formatCurrency(amount, { symbol, showDecimals: true, minValueForSuffix: 1000, maxDecimals: 4 });
  }
};

/**
 * Examples of formatting with 4-digit precision:
 * 
 * Standard formatting:
 * - $0.00 → $0.00
 * - $5.50 → $5.50
 * - $999.99 → $999.99
 * - $1,000 → $1K
 * - $1,234.56 → $1.2346K
 * - $12,345.67 → $12.346K
 * - $123,456.78 → $123.46K
 * - $1,234,567.89 → $1.2346M
 * - $12,345,678.90 → $12.346M
 * - $123,456,789.01 → $123.46M
 * - $1,234,567,890.12 → $1.2346B
 * - $12,345,678,901.23 → $12.346B
 * - $123,456,789,012.34 → $123.46B
 * - $1,234,567,890,123.45 → $1.2346T
 * 
 * Compact formatting (3 decimals max):
 * - $1,234.56 → $1.235K
 * - $12,345.67 → $12.35K
 * - $1,234,567.89 → $1.235M
 * 
 * Detailed formatting (2 decimals, higher threshold):
 * - $1,234.56 → $1,234.56
 * - $12,345.67 → $12.35K (only when >= 10K)
 */