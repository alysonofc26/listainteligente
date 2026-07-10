import type { ProductResult, SearchResult } from "types";
import type { ScraperStrategy } from "./scraper-strategy";

interface VtexProduct {
  productId: string;
  productName: string;
  brand: string;
  link: string;
  description: string;
  items: Array<{
    itemId: string;
    name: string;
    ean: string;
    measurementUnit: string;
    unitMultiplier: number;
    images: Array<{
      imageUrl: string;
    }>;
    sellers: Array<{
      sellerId: string;
      sellerName: string;
      commertialOffer: {
        Price: number;
        ListPrice: number;
        AvailableQuantity: number;
        IsAvailable: boolean;
      };
    }>;
  }>;
}

export class VtexApiStrategy implements ScraperStrategy {
  readonly supermarketId: string;
  readonly supermarketName: string;
  private readonly baseUrl: string;

  constructor(config: {
    supermarketId: string;
    supermarketName: string;
    baseUrl: string;
  }) {
    this.supermarketId = config.supermarketId;
    this.supermarketName = config.supermarketName;
    this.baseUrl = config.baseUrl;
  }

  async search(query: string): Promise<SearchResult> {
    const url = `${this.baseUrl}/api/catalog_system/pub/products/search/${encodeURIComponent(query)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
    } catch {
      return { products: [], total: 0, query, supermarket: this.supermarketId };
    }

    if (!response.ok) {
      return { products: [], total: 0, query, supermarket: this.supermarketId };
    }

    let data: VtexProduct[];
    try {
      data = await response.json();
    } catch {
      return { products: [], total: 0, query, supermarket: this.supermarketId };
    }

    if (!Array.isArray(data)) {
      return { products: [], total: 0, query, supermarket: this.supermarketId };
    }

    const products: ProductResult[] = data
      .filter((p) => {
        const offer = p.items?.[0]?.sellers?.[0]?.commertialOffer;
        return offer?.IsAvailable === true && (offer?.Price ?? 0) > 0;
      })
      .map((p) => {
        const item = p.items?.[0];
        const seller = item?.sellers?.[0];
        const offer = seller?.commertialOffer;
        const image = item?.images?.[0];

        return {
          id: `${p.productId}-${this.supermarketId}`,
          name: p.productName,
          brand: p.brand || null,
          price: offer?.Price ?? 0,
          unitPrice: null,
          image: image?.imageUrl ?? null,
          url: p.link?.startsWith("http")
            ? p.link
            : `${this.baseUrl}${p.link ?? ""}`,
          availability: true,
          updatedAt: new Date().toISOString(),
        };
      });

    return {
      products,
      total: products.length,
      query,
      supermarket: this.supermarketId,
    };
  }

  async getProduct(url: string): Promise<ProductResult | null> {
    const productSlug = this.extractSlug(url);
    if (!productSlug) return null;

    const searchUrl = `${this.baseUrl}/api/catalog_system/pub/products/search/${encodeURIComponent(productSlug)}`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) return null;

      const data: VtexProduct[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const p = data.find(
        (prod) => prod.link?.includes(productSlug),
      ) ?? data[0]!;

      const item = p.items?.[0];
      const seller = item?.sellers?.[0];
      const offer = seller?.commertialOffer;
      const image = item?.images?.[0];

      return {
        id: `${p.productId}-${this.supermarketId}`,
        name: p.productName,
        brand: p.brand || null,
        price: offer?.Price ?? 0,
        unitPrice: null,
        image: image?.imageUrl ?? null,
        url: p.link?.startsWith("http")
          ? p.link
          : `${this.baseUrl}${p.link ?? ""}`,
        availability: offer?.IsAvailable === true,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  private extractSlug(url: string): string | null {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/\/+$/, "");
      const segments = path.split("/").filter(Boolean);
      return segments[segments.length - 1] ?? null;
    } catch {
      return null;
    }
  }
}
