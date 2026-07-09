import type { ProductResult, SearchResult } from "types";
import { ScraperRegistry } from "../registry/scraper-registry";

export interface AggregatedSearchResult {
  products: ProductResult[];
  total: number;
  query: string;
  bySupermarket: Record<string, { products: ProductResult[]; total: number }>;
}

export class SearchService {
  async searchAll(query: string): Promise<AggregatedSearchResult> {
    const scrapers = ScraperRegistry.getAll();
    const results = await Promise.allSettled(
      scrapers.map((s) => s.search(query)),
    );

    const bySupermarket: AggregatedSearchResult["bySupermarket"] = {};
    let allProducts: ProductResult[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        const searchResult: SearchResult = result.value;
        bySupermarket[searchResult.supermarket] = {
          products: searchResult.products,
          total: searchResult.total,
        };
        allProducts = allProducts.concat(searchResult.products);
      }
    }

    return {
      products: allProducts,
      total: allProducts.length,
      query,
      bySupermarket,
    };
  }

  async searchIn(supermarketSlug: string, query: string): Promise<SearchResult> {
    const scraper = ScraperRegistry.get(supermarketSlug);
    return scraper.search(query);
  }
}
