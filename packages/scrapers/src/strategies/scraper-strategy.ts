import type { ProductResult, SearchResult } from "types";

export interface ScraperStrategy {
  readonly supermarketId: string;
  readonly supermarketName: string;
  search(query: string): Promise<SearchResult>;
  getProduct(url: string): Promise<ProductResult | null>;
}
