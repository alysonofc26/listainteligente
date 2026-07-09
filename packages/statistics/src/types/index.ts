export interface MonthlyEvolution {
  month: string;
  total: number;
  purchaseCount: number;
  itemCount: number;
}

export interface HighestPurchase {
  amount: number;
  date: string;
  supermarketName: string | null;
}

export interface LowestPurchase {
  amount: number;
  date: string;
  supermarketName: string | null;
}

export interface ExpenseSummary {
  totalSpent: number;
  monthlyAverage: number;
  weeklyAverage: number;
  annualTotal: number;
  averagePerPurchase: number;
  highestPurchase: HighestPurchase | null;
  lowestPurchase: LowestPurchase | null;
  monthlyEvolution: MonthlyEvolution[];
  totalPurchases: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  purchaseCount: number;
}

export interface SupermarketSpending {
  supermarketId: string | null;
  supermarketName: string | null;
  totalSpent: number;
  purchaseCount: number;
  percentage: number;
}

export interface EconomyBySupermarket {
  supermarketName: string | null;
  saved: number;
}

export interface EconomySummary {
  totalSaved: number;
  bySupermarket: EconomyBySupermarket[];
  monthlyAverage: number;
  bestMonth: { month: string; saved: number } | null;
}

export interface FrequencySummary {
  totalPurchases: number;
  averagePerMonth: number;
  averagePerWeek: number;
  averageTicket: number;
  daysBetweenPurchases: number | null;
  mostFrequentSupermarket: { name: string | null; count: number } | null;
}

export interface ProductSummary {
  productName: string;
  totalQuantity: number;
  totalSpent: number;
  purchaseCount: number;
}

export interface DashboardStats {
  expenseSummary: ExpenseSummary;
  topCategories: CategorySummary[];
  topSupermarkets: SupermarketSpending[];
  economySummary: EconomySummary;
  frequencySummary: FrequencySummary;
  topProducts: ProductSummary[];
}

export interface StatisticsProviderData {
  totalSpent: number;
  monthlyAverage: number;
  totalPurchases: number;
  topCategories: string[];
  preferredSupermarket: string | null;
}
