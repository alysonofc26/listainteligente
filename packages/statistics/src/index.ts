export { StatisticsService } from "./services/statistics-service";
export { StatisticsRepository } from "./repositories/statistics-repository";
export { StatisticsCalculator, calc } from "./calculators";
export { StatisticsMapper } from "./mappers/statistics-mapper";
export { ExpenseAggregator } from "./aggregators/expense-aggregator";
export { CategoryAggregator } from "./aggregators/category-aggregator";
export { SupermarketAggregator } from "./aggregators/supermarket-aggregator";
export { EconomyAggregator } from "./aggregators/economy-aggregator";
export { FrequencyAggregator } from "./aggregators/frequency-aggregator";

export type {
  DashboardStats,
  ExpenseSummary,
  MonthlyEvolution,
  HighestPurchase,
  LowestPurchase,
  CategorySummary,
  SupermarketSpending,
  EconomySummary,
  EconomyBySupermarket,
  FrequencySummary,
  ProductSummary,
  StatisticsProviderData,
} from "./types";
