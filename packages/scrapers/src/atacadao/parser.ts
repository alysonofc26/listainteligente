import { ATACADAO_SELECTORS } from "./constants";
import type { AtacadaoParsedProduct } from "./types";

interface JsonLdProduct {
  name?: string;
  brand?: { name?: string } | string;
  sku?: string;
  gtin?: string;
  image?: string | string[];
  offers?: {
    price?: number;
    priceCurrency?: string;
    availability?: string;
  };
  description?: string;
}

interface JsonLdBreadcrumb {
  itemListElement?: Array<{
    item?: { name?: string; "@id"?: string };
    name?: string;
  }>;
}

export class AtacadaoParser {
  parseProductPage(
    html: string,
    url: string,
  ): AtacadaoParsedProduct | null {
    const jsonLd = this.extractJsonLd<JsonLdProduct>(html);

    if (!jsonLd) return null;

    const name = jsonLd.name?.trim() ?? null;
    if (!name) return null;

    const brand = typeof jsonLd.brand === "string"
      ? jsonLd.brand
      : jsonLd.brand?.name ?? null;

    const price = jsonLd.offers?.price ?? null;
    const imageUrl = Array.isArray(jsonLd.image)
      ? jsonLd.image[0] ?? null
      : jsonLd.image ?? null;
    const sku = jsonLd.sku ?? null;

    const breadcrumb = this.extractJsonLd<JsonLdBreadcrumb>(html, "BreadcrumbList");
    const category = this.extractCategoryFromBreadcrumb(breadcrumb);

    return {
      name,
      brand,
      price: price ?? null,
      unitPrice: null,
      unit: null,
      imageUrl: imageUrl ?? null,
      productUrl: url,
      isPromotion: false,
      promotionLabel: null,
      category,
      sku,
    };
  }

  parseSearchResults(
    html: string,
    _baseUrl: string,
  ): AtacadaoParsedProduct[] {
    const jsonLd = this.extractJsonLd<JsonLdProduct>(html);

    if (jsonLd?.name) {
      const single = this.parseProductPage(html, _baseUrl);
      if (single) return [single];
    }

    return [];
  }

  isVtexSite(html: string): boolean {
    return ATACADAO_SELECTORS.VTEX_ACCOUNT.test(html);
  }

  isOutOfStock(html: string): boolean {
    return ATACADAO_SELECTORS.OUT_OF_STOCK.test(html);
  }

  isSearchablePage(html: string): boolean {
    const hasJsonLd = ATACADAO_SELECTORS.JSON_LD_PRODUCT.test(html);
    const hasOgTitle = ATACADAO_SELECTORS.OG_TITLE.test(html);
    return hasJsonLd || hasOgTitle;
  }

  private extractJsonLd<T>(
    html: string,
    type?: string,
  ): T | null {
    const pattern = type
      ? new RegExp(
          `<script[^>]*type="application/ld\\+json"[^>]*>({[\\s\\S]*?"@type"\\s*:\\s*"${type}"[\\s\\S]*?})<\\/script>`,
          "i",
        )
      : ATACADAO_SELECTORS.JSON_LD_PRODUCT;

    const match = html.match(pattern);
    if (!match?.[1]) return null;

    try {
      return JSON.parse(match[1]) as T;
    } catch {
      return null;
    }
  }

  private extractCategoryFromBreadcrumb(
    breadcrumb: JsonLdBreadcrumb | null,
  ): string | null {
    if (!breadcrumb?.itemListElement) return null;
    const items = breadcrumb.itemListElement;
    if (items.length < 2) return null;

    const secondLast = items[items.length - 2];

    const category = secondLast?.item?.name ?? secondLast?.name ?? null;
    return category;
  }
}


