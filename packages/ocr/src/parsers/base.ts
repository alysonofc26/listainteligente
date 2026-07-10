import type { Parser } from "../types";

export abstract class BaseParser<T> implements Parser<T> {
  abstract canParse(text: string): boolean;
  abstract parse(text: string, confidence: number): T;

  protected extractPrice(text: string): number | null {
    const patterns = [
      // R$ 1.234,56 (preço com milhar)
      /R?\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2}))/,
      // R$ 10,99 ou R$10,99 (vírgula decimal)
      /R?\$?\s*(\d+,\d{2})\b/,
      // R$ 10.99 ou R$10.99 (ponto decimal)
      /R?\$?\s*(\d+\.\d{2})\b/,
      // 10,99 ou 10.99 (apenas números, tentativa mais ampla)
      /(\d+[,.]\d{2})(?:\s*(?:cada|un|kg|unidade|o|a|por|s[oa])|\/)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const normalized = match[1].replace(/\.(?=\d{3})/g, "").replace(",", ".");
        const price = Number.parseFloat(normalized);
        if (!Number.isNaN(price) && price > 0 && price < 1_000_000) return price;
      }
    }
    return null;
  }

  protected extractPriceFromRaw(rawText: string): number | null {
    const cleaned = rawText
      .replace(/[^\w\s.,$%\/\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return this.extractPrice(cleaned);
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
