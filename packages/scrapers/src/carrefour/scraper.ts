import type { ProductResult, SearchResult } from "types";
import type { ScraperInterface } from "../interfaces/scraper.interface";
import type { ScraperConfig } from "../interfaces/scraper.interface";
import { BaseScraper } from "../interfaces/base-scraper";
import { CARREFOUR } from "./constants";
import { CarrefourParser } from "./parser";
import { CarrefourMapper } from "./mapper";

export class CarrefourScraper extends BaseScraper implements ScraperInterface {
  readonly supermarketId = CARREFOUR.SUPERMARKET_ID;

  readonly config: ScraperConfig = {
    baseUrl: CARREFOUR.BASE_URL,
    searchPath: CARREFOUR.SEARCH_PATH,
    rateLimitMs: CARREFOUR.RATE_LIMIT_MS,
  };

  private readonly parser = new CarrefourParser();
  private readonly mapper = new CarrefourMapper();

  async search(query: string): Promise<SearchResult> {
    const searchUrl = `${this.config.baseUrl}${this.config.searchPath}/${encodeURIComponent(query)}`;
    const html = await this.fetch(searchUrl);
    const parsed = this.parser.parseSearchResults(html, this.config.baseUrl);
    const products = this.mapper.toProductResults(parsed);

    return {
      products,
      total: products.length,
      query,
      supermarket: this.supermarketId,
    };
  }

  async getProduct(url: string): Promise<ProductResult | null> {
    const html = await this.fetch(url);
    const parsed = this.parser.parseProductPage(html, url);

    if (!parsed) return null;

    return this.mapper.toProductResult(parsed);
  }
}
