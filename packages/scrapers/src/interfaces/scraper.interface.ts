import type { ProductResult, SearchResult } from "types";

export interface ScraperConfig {
  baseUrl: string;
  searchPath: string;
  rateLimitMs: number;
}

export interface ScraperInterface {
  readonly supermarketId: string;
  search(query: string): Promise<SearchResult>;
  getProduct(url: string): Promise<ProductResult | null>;
}
