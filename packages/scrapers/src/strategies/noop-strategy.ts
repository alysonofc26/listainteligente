import type { ProductResult, SearchResult } from "types";
import type { ScraperStrategy } from "./scraper-strategy";

export class NoopStrategy implements ScraperStrategy {
  readonly supermarketId: string;
  readonly supermarketName: string;

  constructor(config: { supermarketId: string; supermarketName: string }) {
    this.supermarketId = config.supermarketId;
    this.supermarketName = config.supermarketName;
  }

  async search(query: string): Promise<SearchResult> {
    return { products: [], total: 0, query, supermarket: this.supermarketId };
  }

  async getProduct(_url: string): Promise<ProductResult | null> {
    return null;
  }
}
