import type { ProductResult, SearchResult } from "types";
import type { ScraperInterface } from "../interfaces/scraper.interface";
import type { ScraperConfig } from "../interfaces/scraper.interface";
import { BaseScraper } from "../interfaces/base-scraper";
import { ATACADAO } from "./constants";
import { AtacadaoParser } from "./parser";
import { AtacadaoMapper } from "./mapper";

export class AtacadaoScraper extends BaseScraper implements ScraperInterface {
  readonly supermarketId = ATACADAO.SUPERMARKET_ID;

  readonly config: ScraperConfig = {
    baseUrl: ATACADAO.BASE_URL,
    searchPath: ATACADAO.SEARCH_PATH,
    rateLimitMs: ATACADAO.RATE_LIMIT_MS,
  };

  private readonly parser = new AtacadaoParser();
  private readonly mapper = new AtacadaoMapper();

  async search(query: string): Promise<SearchResult> {
    const searchUrl = `${this.config.baseUrl}${this.config.searchPath}?q=${encodeURIComponent(query)}`;
    const html = await this.fetch(searchUrl);

    if (!this.parser.isSearchablePage(html)) {
      return {
        products: [],
        total: 0,
        query,
        supermarket: this.supermarketId,
      };
    }

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
