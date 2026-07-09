import type { EconomySummary, EconomyBySupermarket } from "../types";
import { calc } from "../calculators";

interface ReceiptRow {
  total_amount: number;
  receipt_date: string;
  supermarket: { name: string } | null;
  receipt_items: Array<{ product_name: string; unit_price: number; quantity: number }>;
}

export class EconomyAggregator {
  aggregate(receipts: ReceiptRow[], averagePrices: Map<string, number>): EconomySummary {
    const bySupermarket = new Map<string, { saved: number }>();
    const monthlySavings = new Map<string, number>();
    let totalSaved = 0;

    for (const receipt of receipts) {
      let receiptSaving = 0;

      for (const item of receipt.receipt_items || []) {
        const avgPrice = averagePrices.get(item.product_name.toLowerCase());
        if (avgPrice && avgPrice > item.unit_price) {
          const itemSaving = (avgPrice - item.unit_price) * item.quantity;
          receiptSaving += itemSaving;
        }
      }

      if (receiptSaving > 0) {
        totalSaved += receiptSaving;

        const marketName = receipt.supermarket?.name ?? "Não identificado";
        const marketEntry = bySupermarket.get(marketName) ?? { saved: 0 };
        marketEntry.saved += receiptSaving;
        bySupermarket.set(marketName, marketEntry);

        const monthKey = receipt.receipt_date.slice(0, 7);
        monthlySavings.set(
          monthKey,
          (monthlySavings.get(monthKey) ?? 0) + receiptSaving,
        );
      }
    }

    totalSaved = calc.round(totalSaved);

    const bySupermarketResult: EconomyBySupermarket[] = Array.from(
      bySupermarket.entries(),
    ).map(([name, data]) => ({
      supermarketName: name,
      saved: calc.round(data.saved),
    }));

    const monthCount = Math.max(1, monthlySavings.size);
    const monthlyAverage = calc.round(totalSaved / monthCount);

    let bestMonth: { month: string; saved: number } | null = null;
    for (const [month, saved] of monthlySavings) {
      const rounded = calc.round(saved);
      if (!bestMonth || rounded > bestMonth.saved) {
        bestMonth = { month, saved: rounded };
      }
    }

    return {
      totalSaved,
      bySupermarket: bySupermarketResult,
      monthlyAverage,
      bestMonth,
    };
  }

  calculateFromItems(
    items: Array<{ productName: string; unitPrice: number; quantity: number }>,
    averagePrices: Map<string, number>,
  ): { totalSaved: number; savings: Array<{ productName: string; saved: number }> } {
    let totalSaved = 0;
    const savings: Array<{ productName: string; saved: number }> = [];

    for (const item of items) {
      const avgPrice = averagePrices.get(item.productName.toLowerCase());
      if (avgPrice && avgPrice > item.unitPrice) {
        const itemSaving = (avgPrice - item.unitPrice) * item.quantity;
        const rounded = calc.round(itemSaving);
        totalSaved += rounded;
        savings.push({ productName: item.productName, saved: rounded });
      }
    }

    return { totalSaved: calc.round(totalSaved), savings };
  }
}
