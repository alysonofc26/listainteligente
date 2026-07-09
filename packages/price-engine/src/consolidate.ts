import type {
  ProductComparison,
  ComparisonBySupermarket,
  ComparisonSummary,
} from "./types";

interface ComparisonInput {
  productName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
  supermarketPrices: Array<{
    supermarketId: string;
    supermarketName: string;
    price: number;
    unitPrice: number | null;
    url: string | null;
    image: string | null;
  }>;
}

interface SupermarketSummary {
  name: string;
  total: number;
  itemCount: number;
  availableItems: number;
  unavailableItems: number;
}

export function consolidateComparison(
  items: ComparisonInput[],
): ComparisonSummary {
  const comparisons: ProductComparison[] = [];
  const supermarketData = new Map<string, SupermarketSummary>();
  const supermarketIds = new Set<string>();

  let totalEstimated = 0;
  let totalLowest = 0;
  let totalHighest = 0;
  let productsFound = 0;
  let productsNotFound = 0;

  for (const item of items) {
    const prices = item.supermarketPrices;
    const hasPrices = prices.length > 0;

    for (const p of prices) {
      supermarketIds.add(p.supermarketId);
    }

    if (hasPrices) {
      const sorted = [...prices].sort((a, b) => a.price - b.price);
      const lowest = sorted[0]!;
      const highest = sorted[sorted.length - 1]!;

      const potentialSavings =
        prices.length > 1
          ? Math.round((highest.price - lowest.price) * 100) / 100
          : 0;

      comparisons.push({
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        prices: prices.map((p) => ({
          ...p,
          isAvailable: true,
        })),
        lowestPrice: lowest.price,
        lowestSupermarketId: lowest.supermarketId,
        lowestSupermarketName: lowest.supermarketName,
        highestPrice: highest.price,
        potentialSavings,
      });

      totalLowest += lowest.price * item.quantity;
      totalHighest += highest.price * item.quantity;
      productsFound++;
    } else {
      comparisons.push({
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        prices: [],
        lowestPrice: 0,
        lowestSupermarketId: "",
        lowestSupermarketName: "",
        highestPrice: 0,
        potentialSavings: 0,
      });

      productsNotFound++;
    }

    if (item.estimatedPrice !== null) {
      totalEstimated += item.estimatedPrice * item.quantity;
    }
  }

  for (const item of items) {
    for (const p of item.supermarketPrices) {
      const existing = supermarketData.get(p.supermarketId) ?? {
        name: p.supermarketName,
        total: 0,
        itemCount: 0,
        availableItems: 0,
        unavailableItems: 0,
      };
      existing.total += p.price * (item.quantity || 1);
      existing.itemCount++;
      existing.availableItems++;
      supermarketData.set(p.supermarketId, existing);
    }

    if (item.supermarketPrices.length === 0) {
      for (const sid of supermarketIds) {
        const existing = supermarketData.get(sid) ?? {
          name: "",
          total: 0,
          itemCount: 0,
          availableItems: 0,
          unavailableItems: 0,
        };
        existing.unavailableItems++;
        supermarketData.set(sid, existing);
      }
    } else {
      const foundIds = new Set(item.supermarketPrices.map((p) => p.supermarketId));
      for (const sid of supermarketIds) {
        if (!foundIds.has(sid)) {
          const existing = supermarketData.get(sid) ?? {
            name: "",
            total: 0,
            itemCount: 0,
            availableItems: 0,
            unavailableItems: 0,
          };
          existing.unavailableItems++;
          supermarketData.set(sid, existing);
        }
      }
    }
  }

  const bySupermarket: ComparisonBySupermarket[] = Array.from(
    supermarketData.entries(),
  )
    .filter(([, data]) => data.availableItems > 0)
    .map(([id, data]) => ({
      supermarketId: id,
      supermarketName: data.name,
      total: Math.round(data.total * 100) / 100,
      itemCount: data.itemCount,
      availableItems: data.availableItems,
      unavailableItems: data.unavailableItems,
    }))
    .sort((a, b) => a.total - b.total);

  const totalSavings = Math.round((totalHighest - totalLowest) * 100) / 100;
  const savingsPercentage =
    totalHighest > 0
      ? Math.round((totalSavings / totalHighest) * 100 * 100) / 100
      : 0;

  const bestSupermarket = bySupermarket.length > 0 ? bySupermarket[0]! : null;

  return {
    items: comparisons,
    bySupermarket,
    totalEstimated: Math.round(totalEstimated * 100) / 100,
    totalLowest: Math.round(totalLowest * 100) / 100,
    totalHighest: Math.round(totalHighest * 100) / 100,
    totalSavings,
    savingsPercentage,
    productsFound,
    productsNotFound,
    totalItems: items.length,
    supermarketsConsulted: Array.from(supermarketIds),
    bestSupermarket: bestSupermarket
      ? {
          supermarketId: bestSupermarket.supermarketId,
          supermarketName: bestSupermarket.supermarketName,
          total: bestSupermarket.total,
          savings: Math.round((totalHighest - bestSupermarket.total) * 100) / 100,
        }
      : null,
  };
}
