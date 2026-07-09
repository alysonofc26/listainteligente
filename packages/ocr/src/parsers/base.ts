import type { Parser } from "../types";

export abstract class BaseParser<T> implements Parser<T> {
  abstract canParse(text: string): boolean;
  abstract parse(text: string, confidence: number): T;

  protected extractPrice(text: string): number | null {
    const patterns = [
      /R?\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2}))/, // R$ 1.234,56
      /R?\$?\s*(\d+[,.]\d{2})/, // R$ 10,99
      /(\d+[,.]\d{2})(?:\s*(?:cada|un|kg|unidade))?/i, // 10,99 cada
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const cleaned = match[1].replace(/\./g, "").replace(",", ".");
        const price = Number.parseFloat(cleaned);
        if (!Number.isNaN(price) && price > 0) return price;
      }
    }
    return null;
  }

  protected extractQuantity(text: string): { quantity: number; unit: string } | null {
    const patterns = [
      /(\d+)\s*(kg|g|l|ml|un|unidade|pacote)/i,
      /(kg|g|l|ml)\s*$/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const qty = Number.parseInt(match[1], 10);
        const unit = match[2]!.toLowerCase().replace("unidade", "un");
        if (!Number.isNaN(qty) && qty > 0) return { quantity: qty, unit };
      }
    }
    return null;
  }

  protected cleanText(text: string): string {
    return text
      .replace(/[^\w\sÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç.,$%\/\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
