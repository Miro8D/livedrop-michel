/**
 * Format a number as a currency string, e.g. $1,234.56
 * Defaults to USD and en-US locale, can be customized.
 * 
 * @param amount number to format
 * @param options (optional) { currency: string, locale: string }
 * @returns formatted currency string
 */
export function formatCurrency(
  amount: number,
  options?: { currency?: string; locale?: string }
): string {
  const { currency = "USD", locale = "en-US" } = options || {};
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

