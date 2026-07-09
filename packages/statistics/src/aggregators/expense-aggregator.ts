import type { ExpenseSummary, MonthlyEvolution, HighestPurchase, LowestPurchase } from "../types";
import { calc } from "../calculators";

interface ReceiptRow {
  id: string;
  receipt_date: string;
  total_amount: number;
  supermarket: { name: string } | null;
}

export class ExpenseAggregator {
  aggregate(receipts: ReceiptRow[]): ExpenseSummary {
    if (receipts.length === 0) {
      return {
        totalSpent: 0,
        monthlyAverage: 0,
        weeklyAverage: 0,
        annualTotal: 0,
        averagePerPurchase: 0,
        highestPurchase: null,
        lowestPurchase: null,
        monthlyEvolution: [],
        totalPurchases: 0,
      };
    }

    const amounts = receipts.map((r) => r.total_amount);
    const totalSpent = amounts.reduce((a, b) => a + b, 0);
    const averagePerPurchase = totalSpent / receipts.length;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const yearAgo = new Date(currentYear, currentMonth - 11, 1);

    const recentReceipts = receipts.filter(
      (r) => new Date(r.receipt_date) >= yearAgo,
    );

    const monthlyEvolution = this.buildMonthlyEvolution(recentReceipts);

    const monthCount = Math.max(1, monthlyEvolution.length);
    const monthlyAverage = calc.round(totalSpent / monthCount);

    const weeksCount = Math.max(1, Math.ceil(receipts.length / 4.33));
    const weeklyAverage = calc.round(totalSpent / weeksCount);

    const annualReceipts = receipts.filter((r) => {
      const d = new Date(r.receipt_date);
      return d.getFullYear() === currentYear;
    });
    const annualTotal = calc.round(
      annualReceipts.reduce((sum, r) => sum + r.total_amount, 0),
    );

    const maxAmount = calc.max(amounts);
    const minAmount = calc.min(amounts);

    const highestPurchase = this.findPurchase(receipts, maxAmount);
    const lowestPurchase = this.findPurchase(receipts, minAmount);

    return {
      totalSpent: calc.round(totalSpent),
      monthlyAverage,
      weeklyAverage,
      annualTotal,
      averagePerPurchase: calc.round(averagePerPurchase),
      highestPurchase,
      lowestPurchase,
      monthlyEvolution,
      totalPurchases: receipts.length,
    };
  }

  private buildMonthlyEvolution(receipts: ReceiptRow[]): MonthlyEvolution[] {
    const map = new Map<string, { total: number; count: number; items: number }>();

    for (const receipt of receipts) {
      const key = receipt.receipt_date.slice(0, 7);
      const entry = map.get(key) ?? { total: 0, count: 0, items: 0 };
      entry.total += receipt.total_amount;
      entry.count += 1;
      map.set(key, entry);
    }

    return Array.from(map.entries())
      .map(([month, data]) => ({
        month,
        total: calc.round(data.total),
        purchaseCount: data.count,
        itemCount: data.items,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private findPurchase(
    receipts: ReceiptRow[],
    amount: number,
  ): HighestPurchase | LowestPurchase | null {
    const found = receipts.find((r) => r.total_amount === amount);
    if (!found) return null;

    return {
      amount,
      date: found.receipt_date,
      supermarketName: found.supermarket?.name ?? null,
    };
  }
}
