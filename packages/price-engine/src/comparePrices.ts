import type { PriceComparisonResult } from "./types";

export function comparePrices(
  productName: string,
  prices: Array<{
    supermarketId: string;
    supermarketName: string;
    price: number;
    isPromotion: boolean;
  }>,
): PriceComparisonResult | null {
  if (prices.length === 0) return null;

  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const lowest = sorted[0]!;
  const highest = sorted[sorted.length - 1]!;

  if (prices.length === 1) {
    return {
      productName,
      prices,
      lowestPrice: lowest.price,
      lowestSupermarketId: lowest.supermarketId,
      highestPrice: lowest.price,
      potentialSavings: 0,
    };
  }

  return {
    productName,
    prices,
    lowestPrice: lowest.price,
    lowestSupermarketId: lowest.supermarketId,
    highestPrice: highest.price,
    potentialSavings: Math.round((highest.price - lowest.price) * 100) / 100,
  };
}

export function findBestSupermarket(
  items: Array<{
    productName: string;
    prices: Array<{
      supermarketId: string;
      supermarketName: string;
      price: number;
    }>;
  }>,
): Array<{
  supermarketId: string;
  supermarketName: string;
  total: number;
  itemCount: number;
}> {
  const supermarketTotals = new Map<
    string,
    { name: string; total: number; count: number }
  >();

  for (const item of items) {
    for (const price of item.prices) {
      const current = supermarketTotals.get(price.supermarketId) ?? {
        name: price.supermarketName,
        total: 0,
        count: 0,
      };
      current.total += price.price;
      current.count++;
      supermarketTotals.set(price.supermarketId, current);
    }
  }

  return Array.from(supermarketTotals.entries())
    .map(([id, value]) => ({
      supermarketId: id,
      supermarketName: value.name,
      total: Math.round(value.total * 100) / 100,
      itemCount: value.count,
    }))
    .sort((a, b) => a.total - b.total);
}
