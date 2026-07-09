import type { ProductResult } from "types";
import type { AssaiParsedProduct } from "./types";
import { ASSAI } from "./constants";

function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u00e0-\u00fc-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat("-", ASSAI.SUPERMARKET_ID);
}

export class AssaiMapper {
  toProductResult(parsed: AssaiParsedProduct): ProductResult {
    const now = new Date().toISOString();

    return {
      id: generateProductId(parsed.name),
      name: parsed.name,
      brand: parsed.brand,
      price: parsed.price ?? 0,
      unitPrice: parsed.unitPrice,
      image: parsed.imageUrl,
      url: parsed.productUrl,
      availability: parsed.price !== null,
      updatedAt: now,
    };
  }

  toProductResults(parsed: AssaiParsedProduct[]): ProductResult[] {
    return parsed.map((p) => this.toProductResult(p));
  }
}
