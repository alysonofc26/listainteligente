import { DEFAULT_LOCALE, DEFAULT_CURRENCY } from "./constants";

export function formatCurrency(
  value: number,
  locale = DEFAULT_LOCALE,
  currency = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function calculateSavings(
  higherPrice: number,
  lowerPrice: number,
): number {
  return Math.max(0, higherPrice - lowerPrice);
}

export function calculateSavingsPercentage(
  higherPrice: number,
  lowerPrice: number,
): number {
  if (higherPrice === 0) return 0;
  return ((higherPrice - lowerPrice) / higherPrice) * 100;
}
