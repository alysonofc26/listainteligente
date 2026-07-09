import type { CategorySummary } from "../types";
import { calc } from "../calculators";

interface ReceiptItemRow {
  total_price: number;
  category: string | null;
}

export class CategoryAggregator {
  aggregate(
    items: ReceiptItemRow[],
  ): CategorySummary[] {
    const categoryTotals = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    let totalSpent = 0;

    for (const item of items) {
      const category = item.category ?? "Sem categoria";
      categoryTotals.set(
        category,
        (categoryTotals.get(category) ?? 0) + item.total_price,
      );
      categoryCounts.set(
        category,
        (categoryCounts.get(category) ?? 0) + 1,
      );
      totalSpent += item.total_price;
    }

    const summaries: CategorySummary[] = Array.from(categoryTotals.entries())
      .map(([category, total]) => ({
        category,
        total: calc.round(total),
        percentage: calc.percentage(total, totalSpent),
        purchaseCount: categoryCounts.get(category) ?? 0,
      }))
      .sort((a, b) => b.total - a.total);

    return summaries;
  }
}
