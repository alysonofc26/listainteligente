import type { ProductResult, SearchResult } from "types";
import type { ScraperInterface } from "../interfaces/scraper.interface";
import type { ScraperConfig } from "../interfaces/scraper.interface";
import { BaseScraper } from "../interfaces/base-scraper";
import { ASSAI } from "./constants";
import { AssaiParser } from "./parser";
import { AssaiMapper } from "./mapper";

export class AssaiScraper extends BaseScraper implements ScraperInterface {
  readonly supermarketId = ASSAI.SUPERMARKET_ID;

  readonly config: ScraperConfig = {
    baseUrl: ASSAI.BASE_URL,
    searchPath: ASSAI.SEARCH_PATH,
    rateLimitMs: ASSAI.RATE_LIMIT_MS,
  };

  private readonly parser = new AssaiParser();
  private readonly mapper = new AssaiMapper();

  async search(query: string): Promise<SearchResult> {
    const searchUrl = `${this.config.baseUrl}${this.config.searchPath}?q=${encodeURIComponent(query)}`;
    const html = await this.fetch(searchUrl);

    const { products: parsed, foundSearch } = this.parser.parseSearchResults(
      html,
      this.config.baseUrl,
    );

    if (!foundSearch || parsed.length === 0) {
      return {
        products: [],
        total: 0,
        query,
        supermarket: this.supermarketId,
      };
    }

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
