import { CARREFOUR_SELECTORS } from "./constants";
import type { CarrefourParsedProduct } from "./types";

export class CarrefourParser {
  parseSearchResults(html: string, baseUrl: string): CarrefourParsedProduct[] {
    const products: CarrefourParsedProduct[] = [];
    const regex = CARREFOUR_SELECTORS.PRODUCT_ARTICLE;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      const itemHtml = match[1]!;
      const product = this.parseProductItem(itemHtml, baseUrl);
      if (product) {
        products.push(product);
      }
    }

    return products;
  }

  parseProductPage(html: string, url: string): CarrefourParsedProduct | null {
    const name = this.extractText(html, CARREFOUR_SELECTORS.PRODUCT_NAME);
    if (!name) return null;

    const brand = this.extractText(html, CARREFOUR_SELECTORS.PRODUCT_BRAND);
    const price = this.extractPrice(html, CARREFOUR_SELECTORS.PRODUCT_PRICE);
    const unitInfo = this.extractUnitPrice(html);
    const image = this.extractText(html, CARREFOUR_SELECTORS.PRODUCT_IMAGE);
    const promotionLabel = this.extractText(
      html,
      CARREFOUR_SELECTORS.PROMOTION_LABEL,
    );

    if (price === null) return null;

    return {
      name,
      brand,
      price,
      unitPrice: unitInfo?.unitPrice ?? null,
      unit: unitInfo?.unit ?? null,
      imageUrl: image ?? null,
      productUrl: url,
      isPromotion: promotionLabel !== null,
      promotionLabel: promotionLabel ?? null,
    };
  }

  private parseProductItem(
    itemHtml: string,
    baseUrl: string,
  ): CarrefourParsedProduct | null {
    const name = this.extractText(itemHtml, CARREFOUR_SELECTORS.PRODUCT_NAME);
    if (!name) return null;

    const brand = this.extractText(
      itemHtml,
      CARREFOUR_SELECTORS.PRODUCT_BRAND,
    );
    const price = this.extractPrice(
      itemHtml,
      CARREFOUR_SELECTORS.PRODUCT_PRICE,
    );
    const unitInfo = this.extractUnitPrice(itemHtml);
    const image = this.extractText(
      itemHtml,
      CARREFOUR_SELECTORS.PRODUCT_IMAGE,
    );
    const productUrl = this.extractText(
      itemHtml,
      CARREFOUR_SELECTORS.PRODUCT_LINK,
    );
    const promotionLabel = this.extractText(
      itemHtml,
      CARREFOUR_SELECTORS.PROMOTION_LABEL,
    );

    if (price === null) return null;

    return {
      name,
      brand,
      price,
      unitPrice: unitInfo?.unitPrice ?? null,
      unit: unitInfo?.unit ?? null,
      imageUrl: image ?? null,
      productUrl: productUrl
        ? productUrl.startsWith("http")
          ? productUrl
          : `${baseUrl}${productUrl}`
        : baseUrl,
      isPromotion: promotionLabel !== null,
      promotionLabel: promotionLabel ?? null,
    };
  }

  isOutOfStock(html: string): boolean {
    return CARREFOUR_SELECTORS.OUT_OF_STOCK.test(html);
  }

  private extractText(text: string, regex: RegExp): string | null {
    const match = text.match(regex);
    return match?.[1]?.trim() ?? null;
  }

  private extractPrice(text: string, regex: RegExp): number | null {
    const match = text.match(regex);
    if (!match?.[1]) return null;
    const cleaned = match[1].replace(/\./g, "").replace(",", ".");
    const value = Number.parseFloat(cleaned);
    return Number.isNaN(value) ? null : value;
  }

  private extractUnitPrice(
    text: string,
  ): { unitPrice: number; unit: string } | null {
    const match = text.match(CARREFOUR_SELECTORS.PRODUCT_UNIT_PRICE);
    if (!match) return null;
    const value = Number.parseFloat(match[1]!.replace(",", "."));
    if (Number.isNaN(value)) return null;
    return { unitPrice: value, unit: match[2]! };
  }
}
