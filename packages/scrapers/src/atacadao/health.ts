import { ATACADAO } from "./constants";
import { AtacadaoParser } from "./parser";

export interface HealthCheckResult {
  supermarketId: string;
  status: "healthy" | "degraded" | "unavailable";
  timestamp: string;
  checks: {
    siteAccessible: boolean;
    searchWorks: boolean;
    productPagesAvailable: boolean;
    hasJsonLd: boolean;
    siteChanged: boolean;
    isVtex: boolean;
  };
  details: string[];
  suggestions: string[];
}

export class AtacadaoHealth {
  private readonly parser = new AtacadaoParser();
  private lastKnownHash: string | null = null;

  async check(): Promise<HealthCheckResult> {
    const checks = {
      siteAccessible: false,
      searchWorks: false,
      productPagesAvailable: false,
      hasJsonLd: false,
      siteChanged: false,
      isVtex: false,
    };

    const details: string[] = [];
    const suggestions: string[] = [];

    try {
      const homepageResponse = await fetch(ATACADAO.BASE_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!homepageResponse.ok) {
        details.push(`Site returned HTTP ${homepageResponse.status}`);
        suggestions.push("Verify if atacadao.com.br is accessible");
        return {
          supermarketId: ATACADAO.SUPERMARKET_ID,
          status: "unavailable",
          timestamp: new Date().toISOString(),
          checks,
          details,
          suggestions,
        };
      }

      checks.siteAccessible = true;
      details.push("Site is accessible");

      const homepageHtml = await homepageResponse.text();
      checks.isVtex = this.parser.isVtexSite(homepageHtml);

      if (checks.isVtex) {
        details.push("Platform: VTEX (via Carrefour Group)");
      }

      const currentHash = this.computeHash(homepageHtml);
      if (this.lastKnownHash && currentHash !== this.lastKnownHash) {
        checks.siteChanged = true;
        details.push(
          "Site structure appears to have changed since last check",
        );
        suggestions.push(
          "Review JSON-LD selectors in constants.ts to ensure they still match",
        );
      }
      this.lastKnownHash = currentHash;

      const searchResponse = await fetch(
        `${ATACADAO.BASE_URL}${ATACADAO.SEARCH_PATH}?q=arroz`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );

      checks.searchWorks = searchResponse.ok;
      if (searchResponse.ok) {
        details.push("Search endpoint is accessible");
      } else {
        details.push(
          `Search endpoint returned HTTP ${searchResponse.status} — search is client-side rendered`,
        );
      }

      const productUrl =
        `${ATACADAO.BASE_URL}/leite-longa-vida-italac-com-tampa-integral-tp-com-1l-34808-32346/p`;
      const productResponse = await fetch(productUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (productResponse.ok) {
        const productHtml = await productResponse.text();
        const parsed = this.parser.parseProductPage(productHtml, productUrl);
        checks.productPagesAvailable = parsed !== null;
        checks.hasJsonLd = checks.productPagesAvailable;

        if (parsed) {
          details.push(
            `Product page OK: "${parsed.name}" — R$ ${parsed.price}`,
          );
        } else {
          details.push("Product page accessible but failed to parse JSON-LD");
          suggestions.push(
            "Verify JSON-LD structure in product pages has not changed",
          );
        }
      } else {
        details.push(
          `Product page returned HTTP ${productResponse.status}`,
        );
        suggestions.push("Verify product page URL pattern");
      }

      const hasProducts = checks.productPagesAvailable;
      const status =
        checks.siteAccessible && hasProducts
          ? "healthy"
          : checks.siteAccessible
            ? "degraded"
            : "unavailable";

      return {
        supermarketId: ATACADAO.SUPERMARKET_ID,
        status,
        timestamp: new Date().toISOString(),
        checks,
        details,
        suggestions,
      };
    } catch (error) {
      return {
        supermarketId: ATACADAO.SUPERMARKET_ID,
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
