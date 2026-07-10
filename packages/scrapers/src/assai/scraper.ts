import type { ProductResult, SearchResult } from "types";
import type { ScraperInterface } from "../interfaces/scraper.interface";
import type { ScraperConfig } from "../interfaces/scraper.interface";
import { BaseScraper } from "../interfaces/base-scraper";
import { NoopStrategy } from "../strategies/noop-strategy";

const SUPERMARKET_ID = "assai";
const SUPERMARKET_NAME = "Assaí";
const BASE_URL = "https://www.assai.com.br";
const RATE_LIMIT_MS = 1000;

export class AssaiScraper extends BaseScraper implements ScraperInterface {
  readonly supermarketId = SUPERMARKET_ID;

  readonly config: ScraperConfig = {
    baseUrl: BASE_URL,
    searchPath: "/busca",
    rateLimitMs: RATE_LIMIT_MS,
  };

  private readonly strategy = new NoopStrategy({
    supermarketId: SUPERMARKET_ID,
    supermarketName: SUPERMARKET_NAME,
  });

  async search(query: string): Promise<SearchResult> {
    return this.strategy.search(query);
  }

  async getProduct(url: string): Promise<ProductResult | null> {
    return this.strategy.getProduct(url);
  }
}
