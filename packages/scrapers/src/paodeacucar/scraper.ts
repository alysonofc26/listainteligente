import type { ProductResult, SearchResult } from "types";
import type { ScraperInterface } from "../interfaces/scraper.interface";
import type { ScraperConfig } from "../interfaces/scraper.interface";
import { BaseScraper } from "../interfaces/base-scraper";

const SUPERMARKET_ID = "paodeacucar";
const BASE_URL = "https://www.paodeacucar.com.br";
const SEARCH_PATH = "/busca";
const RATE_LIMIT_MS = 2000;

export class PaoDeAcucarScraper extends BaseScraper implements ScraperInterface {
  readonly supermarketId = SUPERMARKET_ID;

  readonly config: ScraperConfig = {
    baseUrl: BASE_URL,
    searchPath: SEARCH_PATH,
    rateLimitMs: RATE_LIMIT_MS,
  };

  async search(_query: string): Promise<SearchResult> {
    throw new Error(`Scraper for '${SUPERMARKET_ID}' not yet implemented`);
  }

  async getProduct(_url: string): Promise<ProductResult | null> {
    throw new Error(`Scraper for '${SUPERMARKET_ID}' not yet implemented`);
  }
}
