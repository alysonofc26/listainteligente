import type { ProductResult } from "types";
import type { CarrefourParsedProduct } from "./types";
import { CARREFOUR } from "./constants";

function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u00e0-\u00fc-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat("-", CARREFOUR.SUPERMARKET_ID);
}

export class CarrefourMapper {
  toProductResult(parsed: CarrefourParsedProduct): ProductResult {
    return {
      id: generateProductId(parsed.name),
      name: parsed.name,
      brand: parsed.brand,
      price: parsed.price,
      unitPrice: parsed.unitPrice,
      image: parsed.imageUrl,
      url: parsed.productUrl,
      availability: true,
      updatedAt: new Date().toISOString(),
    };
  }

  toProductResults(parsed: CarrefourParsedProduct[]): ProductResult[] {
    return parsed.map((p) => this.toProductResult(p));
  }
}
