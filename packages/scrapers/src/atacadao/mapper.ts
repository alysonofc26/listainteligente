import type { ProductResult } from "types";
import type { AtacadaoParsedProduct } from "./types";
import { ATACADAO } from "./constants";

function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u00e0-\u00fc-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat("-", ATACADAO.SUPERMARKET_ID);
}

export class AtacadaoMapper {
  toProductResult(parsed: AtacadaoParsedProduct): ProductResult {
    const now = new Date().toISOString();

    return {
      id: parsed.sku
        ? `${parsed.sku}-${ATACADAO.SUPERMARKET_ID}`
        : generateProductId(parsed.name),
      name: parsed.name,
      brand: parsed.brand,
      price: parsed.price ?? 0,
      unitPrice: parsed.unitPrice,
      image: parsed.imageUrl,
      url: parsed.productUrl,
      availability: parsed.price !== null && parsed.price > 0,
      updatedAt: now,
    };
  }

  toProductResults(parsed: AtacadaoParsedProduct[]): ProductResult[] {
    return parsed.map((p) => this.toProductResult(p));
  }
}
