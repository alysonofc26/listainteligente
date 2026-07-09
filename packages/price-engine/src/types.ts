export interface PriceEngineItem {
  quantity: number;
  unitPrice: number | null;
}

export interface PriceEngineTotals {
  subtotal: number;
  itemCount: number;
  itemsWithPrice: number;
  itemsWithoutPrice: number;
  averagePrice: number | null;
}

export interface PriceComparisonResult {
  productName: string;
  prices: Array<{
    supermarketId: string;
    supermarketName: string;
    price: number;
    isPromotion: boolean;
  }>;
  lowestPrice: number;
  lowestSupermarketId: string;
  highestPrice: number;
  potentialSavings: number;
}

export interface EconomyResult {
  totalWithoutSavings: number;
  totalWithSavings: number;
  totalSaved: number;
  savingsPercentage: number;
  itemSavings: Array<{
    productName: string;
    originalPrice: number;
    discountedPrice: number;
    saved: number;
  }>;
}

export interface ProductComparison {
  productName: string;
  quantity: number;
  unit: string;
  prices: Array<{
    supermarketId: string;
    supermarketName: string;
    price: number;
    unitPrice: number | null;
    isAvailable: boolean;
    url: string | null;
    image: string | null;
  }>;
  lowestPrice: number;
  lowestSupermarketId: string;
  lowestSupermarketName: string;
  highestPrice: number;
  potentialSavings: number;
}

export interface ComparisonBySupermarket {
  supermarketId: string;
  supermarketName: string;
  total: number;
  itemCount: number;
  availableItems: number;
  unavailableItems: number;
}

export interface ComparisonSummary {
  items: ProductComparison[];
  bySupermarket: ComparisonBySupermarket[];
  totalEstimated: number;
  totalLowest: number;
  totalHighest: number;
  totalSavings: number;
  savingsPercentage: number;
  productsFound: number;
  productsNotFound: number;
  totalItems: number;
  supermarketsConsulted: string[];
  bestSupermarket: {
    supermarketId: string;
    supermarketName: string;
    total: number;
    savings: number;
  } | null;
}
