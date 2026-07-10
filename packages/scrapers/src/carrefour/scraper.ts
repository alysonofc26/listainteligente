import type { ProductResult, SearchResult } from "types";
import type { ScraperInterface } from "../interfaces/scraper.interface";
import type { ScraperConfig } from "../interfaces/scraper.interface";
import { BaseScraper } from "../interfaces/base-scraper";
import { VtexApiStrategy } from "../strategies/vtex-api-strategy";

const SUPERMARKET_ID = "carrefour";
const SUPERMARKET_NAME = "Carrefour";
const BASE_URL = "https://www.carrefour.com.br";
const RATE_LIMIT_MS = 1000;

export class CarrefourScraper extends BaseScraper implements ScraperInterface {
  readonly supermarketId = SUPERMARKET_ID;

  readonly config: ScraperConfig = {
    baseUrl: BASE_URL,
    searchPath: "/busca",
    rateLimitMs: RATE_LIMIT_MS,
  };

  private readonly strategy = new VtexApiStrategy({
    supermarketId: SUPERMARKET_ID,
    supermarketName: SUPERMARKET_NAME,
    baseUrl: BASE_URL,
  });

  async search(query: string): Promise<SearchResult> {
    return this.strategy.search(query);
  }

  async getProduct(url: string): Promise<ProductResult | null> {
    return this.strategy.getProduct(url);
  }
}
