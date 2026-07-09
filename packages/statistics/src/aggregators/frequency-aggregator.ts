import type { FrequencySummary } from "../types";
import { calc } from "../calculators";

interface ReceiptRow {
  id: string;
  receipt_date: string;
  total_amount: number;
  supermarket: { name: string } | null;
}

export class FrequencyAggregator {
  aggregate(
    receipts: ReceiptRow[],
  ): FrequencySummary {
    const totalPurchases = receipts.length;

    if (totalPurchases === 0) {
      return {
        totalPurchases: 0,
        averagePerMonth: 0,
        averagePerWeek: 0,
        averageTicket: 0,
        daysBetweenPurchases: null,
        mostFrequentSupermarket: null,
      };
    }

    const dates = receipts
      .map((r) => new Date(r.receipt_date))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstDate = dates[0]!;
    const lastDate = dates[dates.length - 1]!;
    const daysDiff =
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const monthsSpan = Math.max(1, Math.ceil(daysDiff / 30.44));
    const weeksSpan = Math.max(1, Math.ceil(daysDiff / 7));

    const averagePerMonth = calc.round(totalPurchases / monthsSpan);
    const averagePerWeek = calc.round(totalPurchases / weeksSpan);

    const amounts = receipts.map((r) => r.total_amount);
    const totalSpent = amounts.reduce((a, b) => a + b, 0);
    const averageTicket = calc.round(totalSpent / totalPurchases);

    const daysBetweenPurchases =
      daysDiff > 0 && totalPurchases > 1
        ? calc.round(daysDiff / (totalPurchases - 1))
        : null;

    const supermarketCounts = new Map<string, { name: string | null; count: number }>();

    for (const receipt of receipts) {
      const name = receipt.supermarket?.name ?? "Não identificado";
      const entry = supermarketCounts.get(name) ?? { name: receipt.supermarket?.name ?? null, count: 0 };
      entry.count += 1;
      supermarketCounts.set(name, entry);
    }

    let mostFrequentSupermarket: { name: string | null; count: number } | null = null;
    for (const [, entry] of supermarketCounts) {
      if (!mostFrequentSupermarket || entry.count > mostFrequentSupermarket.count) {
        mostFrequentSupermarket = entry;
      }
    }

    return {
      totalPurchases,
      averagePerMonth,
      averagePerWeek,
      averageTicket,
      daysBetweenPurchases,
      mostFrequentSupermarket,
    };
  }
}
