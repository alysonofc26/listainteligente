import type { SupermarketSpending } from "../types";
import { calc } from "../calculators";

interface ReceiptRow {
  total_amount: number;
  supermarket: { id: string; name: string } | null;
}

export class SupermarketAggregator {
  aggregate(
    receipts: ReceiptRow[],
  ): SupermarketSpending[] {
    if (receipts.length === 0) return [];

    const supermarketTotals = new Map<
      string,
      { name: string | null; total: number; count: number }
    >();
    let totalSpent = 0;

    for (const receipt of receipts) {
      const id = receipt.supermarket?.id ?? "unknown";
      const name = receipt.supermarket?.name ?? "Não identificado";
      const entry = supermarketTotals.get(id) ?? { name, total: 0, count: 0 };
      entry.total += receipt.total_amount;
      entry.count += 1;
      supermarketTotals.set(id, entry);
      totalSpent += receipt.total_amount;
    }

    const summaries: SupermarketSpending[] = Array.from(
      supermarketTotals.entries(),
    ).map(([id, data]) => ({
      supermarketId: id === "unknown" ? null : id,
      supermarketName: data.name,
      totalSpent: calc.round(data.total),
      purchaseCount: data.count,
      percentage: calc.percentage(data.total, totalSpent),
    }));

    summaries.sort((a, b) => b.totalSpent - a.totalSpent);

    return summaries;
  }
}
