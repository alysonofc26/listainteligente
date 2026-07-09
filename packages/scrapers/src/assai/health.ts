import { ASSAI } from "./constants";
import { AssaiParser } from "./parser";

export interface HealthCheckResult {
  supermarketId: string;
  status: "healthy" | "degraded" | "unavailable";
  timestamp: string;
  checks: {
    siteAccessible: boolean;
    searchWorks: boolean;
    selectorsMatch: boolean;
    hasProducts: boolean;
    siteChanged: boolean;
  };
  details: string[];
  suggestions: string[];
}

export class AssaiHealth {
  private readonly parser = new AssaiParser();
  private lastKnownHash: string | null = null;

  async check(): Promise<HealthCheckResult> {
    const checks = {
      siteAccessible: false,
      searchWorks: false,
      selectorsMatch: false,
      hasProducts: false,
      siteChanged: false,
    };

    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const response = await fetch(ASSAI.BASE_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        details.push(`Site returned HTTP ${response.status}`);
        suggestions.push("Verify if assai.com.br is accessible");
        return {
          supermarketId: ASSAI.SUPERMARKET_ID,
          status: "unavailable",
          timestamp: new Date().toISOString(),
          checks,
          details,
          suggestions,
        };
      }

      checks.siteAccessible = true;
      details.push("Site is accessible");

      const html = await response.text();

      const isInstitutional = this.parser.isInstitutionalSite(html);
      if (isInstitutional) {
        details.push(
          "Site is institutional (Drupal) — no e-commerce product search available",
        );
        suggestions.push(
          "Assaí does not currently offer online product search. Their e-commerce is via Rappi/Uber/Mercado Livre.",
        );
        suggestions.push(
          "When Assaí launches their own e-commerce, update the search path and selectors in constants.ts",
        );
      }

      const currentHash = this.computeHash(html);
      if (this.lastKnownHash && currentHash !== this.lastKnownHash) {
        checks.siteChanged = true;
        details.push("Site structure appears to have changed since last check");
        suggestions.push(
          "Review selectors in constants.ts to ensure they still match",
        );
      }
      this.lastKnownHash = currentHash;

      checks.hasProducts = html.includes("views-row") || html.includes("node-title");

      const searchResponse = await fetch(
        `${ASSAI.BASE_URL}${ASSAI.SEARCH_PATH}?q=arroz`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );

      if (searchResponse.ok) {
        checks.searchWorks = true;
        details.push("Search endpoint is accessible");
      } else {
        details.push(
          `Search endpoint returned HTTP ${searchResponse.status}`,
        );
        suggestions.push(
          "Verify the search path in constants.ts (current: /busca)",
        );
      }

      checks.selectorsMatch = checks.hasProducts;

      const status =
        checks.siteAccessible && checks.hasProducts
          ? "healthy"
          : checks.siteAccessible
            ? "degraded"
            : "unavailable";

      return {
        supermarketId: ASSAI.SUPERMARKET_ID,
        status,
        timestamp: new Date().toISOString(),
        checks,
        details,
        suggestions,
      };
    } catch (error) {
      return {
        supermarketId: ASSAI.SUPERMARKET_ID,
        status: "unavailable",
        timestamp: new Date().toISOString(),
        checks,
        details: [
          `Error accessing site: ${error instanceof Error ? error.message : String(error)}`,
        ],
        suggestions: ["Check network connectivity"],
      };
    }
  }

  private computeHash(text: string): string {
    let hash = 0;
    const sample = text.slice(0, 5000);
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString(36);
  }
}
