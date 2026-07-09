import { StatisticsRepository } from "../repositories/statistics-repository";
import { ExpenseAggregator } from "../aggregators/expense-aggregator";
import { CategoryAggregator } from "../aggregators/category-aggregator";
import { SupermarketAggregator } from "../aggregators/supermarket-aggregator";
import { EconomyAggregator } from "../aggregators/economy-aggregator";
import { FrequencyAggregator } from "../aggregators/frequency-aggregator";
import type { DashboardStats, ExpenseSummary, CategorySummary, SupermarketSpending, EconomySummary, FrequencySummary, ProductSummary, StatisticsProviderData } from "../types";
import { StatisticsMapper } from "../mappers/statistics-mapper";

export class StatisticsService {
  private readonly repository: StatisticsRepository;
  private readonly expenseAggregator: ExpenseAggregator;
  private readonly categoryAggregator: CategoryAggregator;
  private readonly supermarketAggregator: SupermarketAggregator;
  private readonly economyAggregator: EconomyAggregator;
  private readonly frequencyAggregator: FrequencyAggregator;
  private readonly mapper: StatisticsMapper;

  constructor(supabase: any) {
    this.repository = new StatisticsRepository(supabase);
    this.expenseAggregator = new ExpenseAggregator();
    this.categoryAggregator = new CategoryAggregator();
    this.supermarketAggregator = new SupermarketAggregator();
    this.economyAggregator = new EconomyAggregator();
    this.frequencyAggregator = new FrequencyAggregator();
    this.mapper = new StatisticsMapper();
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [receipts, items, topProducts] = await Promise.all([
      this.repository.listReceipts(userId),
      this.repository.listReceiptItems(userId),
      this.repository.listTopProducts(userId),
    ]);

    const expenseSummary = this.expenseAggregator.aggregate(receipts);
    const topCategories = this.categoryAggregator.aggregate(items);
    const topSupermarkets = this.supermarketAggregator.aggregate(receipts);

    const allPrices = await this.repository.listAllProductPrices(userId);
    const averagePrices = this.repository.buildAveragePriceMap(allPrices);
    const economySummary = this.economyAggregator.aggregate(receipts, averagePrices);

    const frequencySummary = this.frequencyAggregator.aggregate(receipts);

    return {
      expenseSummary,
      topCategories,
      topSupermarkets,
      economySummary,
      frequencySummary,
      topProducts,
    };
  }

  async getProviderData(userId: string): Promise<StatisticsProviderData> {
    const stats = await this.getDashboardStats(userId);
    return this.mapper.toProviderData(stats);
  }

  async getExpenseSummary(userId: string): Promise<ExpenseSummary> {
    const receipts = await this.repository.listReceipts(userId);
    return this.expenseAggregator.aggregate(receipts);
  }

  async getTopCategories(userId: string): Promise<CategorySummary[]> {
    const items = await this.repository.listReceiptItems(userId);
    return this.categoryAggregator.aggregate(items);
  }

  async getTopSupermarkets(userId: string): Promise<SupermarketSpending[]> {
    const receipts = await this.repository.listReceipts(userId);
    return this.supermarketAggregator.aggregate(receipts);
  }

  async getEconomySummary(userId: string): Promise<EconomySummary> {
    const receipts = await this.repository.listReceipts(userId);
    const allPrices = await this.repository.listAllProductPrices(userId);
    const averagePrices = this.repository.buildAveragePriceMap(allPrices);
    return this.economyAggregator.aggregate(receipts, averagePrices);
  }

  async getFrequencySummary(userId: string): Promise<FrequencySummary> {
    const receipts = await this.repository.listReceipts(userId);
    return this.frequencyAggregator.aggregate(receipts);
  }

  async getTopProducts(userId: string): Promise<ProductSummary[]> {
    return await this.repository.listTopProducts(userId);
  }
}
