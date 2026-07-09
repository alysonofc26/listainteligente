import type { EconomyResult } from "./types";

export function calculateEconomy(
  items: Array<{
    productName: string;
    originalPrice: number;
    discountedPrice: number;
  }>,
): EconomyResult {
  let totalWithoutSavings = 0;
  let totalWithSavings = 0;
  const itemSavings: EconomyResult["itemSavings"] = [];

  for (const item of items) {
    const saved = item.originalPrice - item.discountedPrice;
    totalWithoutSavings += item.originalPrice;
    totalWithSavings += item.discountedPrice;

    if (saved > 0) {
      itemSavings.push({
        productName: item.productName,
        originalPrice: item.originalPrice,
        discountedPrice: item.discountedPrice,
        saved: Math.round(saved * 100) / 100,
      });
    }
  }

  const totalSaved = Math.round((totalWithoutSavings - totalWithSavings) * 100) / 100;
  const savingsPercentage =
    totalWithoutSavings > 0
      ? Math.round((totalSaved / totalWithoutSavings) * 100 * 100) / 100
      : 0;

  return {
    totalWithoutSavings: Math.round(totalWithoutSavings * 100) / 100,
    totalWithSavings: Math.round(totalWithSavings * 100) / 100,
    totalSaved,
    savingsPercentage,
    itemSavings,
  };
}

export function estimatedMonthlySavings(
  monthlyEconomies: number[],
): number {
  if (monthlyEconomies.length === 0) return 0;
  const total = monthlyEconomies.reduce((sum, val) => sum + val, 0);
  return Math.round((total / monthlyEconomies.length) * 100) / 100;
}
