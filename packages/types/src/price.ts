import type { BaseEntity } from "./common";

export interface PriceHistory extends BaseEntity {
  product_id: string;
  supermarket_id: string;
  price: number;
  price_per_unit: number | null;
  recorded_at: string;
}

export interface PriceComparison {
  product_id: string;
  product_name: string;
  prices: Array<{
    supermarket_id: string;
    supermarket_name: string;
    price: number;
    is_promotion: boolean;
  }>;
  lowest_price: number;
  lowest_supermarket_id: string;
  lowest_supermarket_name: string;
  savings: number;
}

export interface CartComparison {
  supermarket_id: string;
  supermarket_name: string;
  total: number;
  item_count: number;
  savings_vs_highest: number;
}
