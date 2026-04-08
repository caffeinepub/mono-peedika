/**
 * Format a price in paise to Indian Rupee format: ₹X,XXX.XX
 * Backend stores prices as bigint paise (1 rupee = 100 paise)
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Calculate discounted price in paise
 */
export function discountedPrice(
  pricePaise: number,
  discountPercent: number,
): number {
  if (discountPercent <= 0) return pricePaise;
  return Math.round(pricePaise * (1 - discountPercent / 100));
}

/**
 * Format a bigint price (from backend) to display string
 */
export function formatBigIntPrice(paise: bigint): string {
  return formatPrice(Number(paise));
}
