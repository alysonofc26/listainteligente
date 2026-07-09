import type { DashboardStats, StatisticsProviderData } from "../types";

export class StatisticsMapper {
  toProviderData(stats: DashboardStats): StatisticsProviderData {
    return {
      totalSpent: stats.expenseSummary.totalSpent,
      monthlyAverage: stats.expenseSummary.monthlyAverage,
      totalPurchases: stats.expenseSummary.totalPurchases,
      topCategories: stats.topCategories.slice(0, 5).map((c) => c.category),
      preferredSupermarket: stats.topSupermarkets[0]?.supermarketName ?? null,
    };
  }
}
