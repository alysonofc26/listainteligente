import { BaseParser } from "./base";
import type { LabelResult } from "../types";

export class LabelParser extends BaseParser<LabelResult> {
  canParse(text: string): boolean {
    const cleaned = this.cleanText(text);
    const hasWord = cleaned.length >= 3;
    const hasPrice = this.extractPrice(cleaned) !== null;
    return hasWord || hasPrice;
  }

  parse(text: string, confidence: number): LabelResult {
    const cleaned = this.cleanText(text);
    let price = this.extractPrice(cleaned);

    if (price === null) {
      price = this.extractPriceFromRaw(text);
    }

    const quantity = this.extractQuantity(cleaned);
    const productName = this.extractProductName(cleaned, price);

    return {
      productName,
      price,
      quantity: quantity?.quantity ?? null,
      unit: quantity?.unit ?? null,
      confidence,
      rawText: text,
    };
  }

  private extractProductName(text: string, price: number | null): string | null {
    let name = text;

    if (price !== null) {
      name = name
        .replace(/R?\$?\s*[\d.,]+\s*/g, "")
        .replace(/\d+[,.]\d{2}/g, "")
        .trim();
    }

    name = name
      .replace(/^\s*(?:leve|por|cada|unit[áa]rio|pre[çc]o)\s*/gi, "")
      .replace(/\s*(?:kg|g|l|ml|un)\s*$/i, "")
      .trim();

    if (name.length < 2) return null;
    return name;
  }
}
