import { ASSAI_SELECTORS, ASSAI_CATEGORIES } from "./constants";
import type { AssaiParsedProduct } from "./types";

export class AssaiParser {
  parseSearchResults(
    html: string,
    baseUrl: string,
  ): { products: AssaiParsedProduct[]; foundSearch: boolean } {
    const foundSearch =
      ASSAI_SELECTORS.SEARCH_FORM.test(html) ||
      html.includes("views-row") ||
      html.includes("node-title");

    let categoryProducts: AssaiParsedProduct[] = [];

    for (const category of ASSAI_CATEGORIES) {
      const categoryHtml = this.extractCategorySection(html, category);
      if (categoryHtml) {
        const parsed = this.parseCategoryItem(categoryHtml, baseUrl, category);
        if (parsed) {
          categoryProducts.push(parsed);
        }
      }
    }

    const regexProducts = this.parseGenericItems(html, baseUrl);

    const products = [...regexProducts, ...categoryProducts];

    const seen = new Set<string>();
    const unique = products.filter((p) => {
      const key = p.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { products: unique, foundSearch };
  }

  parseProductPage(
    html: string,
    url: string,
  ): AssaiParsedProduct | null {
    const name = this.extractText(html, ASSAI_SELECTORS.PRODUCT_NAME);
    if (!name) return null;

    const brand = this.extractText(html, ASSAI_SELECTORS.PRODUCT_BRAND);
    const price = this.extractPrice(html, ASSAI_SELECTORS.PRODUCT_PRICE);
    const image = this.extractText(html, ASSAI_SELECTORS.PRODUCT_IMAGE);
    const promotionLabel = this.extractText(
      html,
      ASSAI_SELECTORS.PROMOTION_LABEL,
    );
    const unitInfo = this.extractUnitPrice(html);

    const categoryMatch =
      url.match(/\/(?:categoria\/)?([a-z]+(?:-[a-z]+)*)/i);
    const category = categoryMatch?.[1] ?? null;

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
      category,
    };
  }

  private parseGenericItems(
    html: string,
    baseUrl: string,
  ): AssaiParsedProduct[] {
    const products: AssaiParsedProduct[] = [];
    const regex = ASSAI_SELECTORS.PRODUCT_ITEM;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      const itemHtml = match[1]!;
      const product = this.parseGenericItem(itemHtml, baseUrl);
      if (product) products.push(product);
    }

    return products;
  }

  private parseGenericItem(
    itemHtml: string,
    baseUrl: string,
  ): AssaiParsedProduct | null {
    const name = this.extractText(itemHtml, ASSAI_SELECTORS.PRODUCT_NAME);
    if (!name) return null;

    const brand = this.extractText(itemHtml, ASSAI_SELECTORS.PRODUCT_BRAND);
    const price = this.extractPrice(itemHtml, ASSAI_SELECTORS.PRODUCT_PRICE);
    const image = this.extractText(itemHtml, ASSAI_SELECTORS.PRODUCT_IMAGE);
    const productUrl = this.extractText(
      itemHtml,
      ASSAI_SELECTORS.PRODUCT_LINK,
    );
    const promotionLabel = this.extractText(
      itemHtml,
      ASSAI_SELECTORS.PROMOTION_LABEL,
    );
    const unitInfo = this.extractUnitPrice(itemHtml);

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
      category: null,
    };
  }

  private parseCategoryItem(
    html: string,
    baseUrl: string,
    categorySlug: string,
  ): AssaiParsedProduct | null {
    const name = this.extractText(html, /<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!name) return null;

    const image = this.extractText(html, /src="([^"]+)"/);
    const link = this.extractText(html, /href="(\/[^"]+)"/);

    return {
      name,
      brand: null,
      price: null,
      unitPrice: null,
      unit: null,
      imageUrl: image ?? null,
      productUrl: link ? `${baseUrl}${link}` : `${baseUrl}/${categorySlug}`,
      isPromotion: false,
      promotionLabel: null,
      category: categorySlug,
    };
  }

  private extractCategorySection(
    html: string,
    category: string,
  ): string | null {
    const regex = new RegExp(
      `<div[^>]*class="[^"]*categoria-${category}[^"]*"[^>]*>([\s\S]*?)<\/div>`,
      "i",
    );
    const match = html.match(regex);
    return match?.[1] ?? null;
  }

  isOutOfStock(html: string): boolean {
    return ASSAI_SELECTORS.OUT_OF_STOCK.test(html);
  }

  isInstitutionalSite(html: string): boolean {
    return (
      html.includes("Pular para o conteúdo principal") &&
      html.includes("node-type-")
    );
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
    const match = text.match(ASSAI_SELECTORS.PRODUCT_PRICE_UNIT);
    if (!match) return null;
    const value = Number.parseFloat(match[1]!.replace(",", "."));
    if (Number.isNaN(value)) return null;
    return { unitPrice: value, unit: match[2]! };
  }
}
