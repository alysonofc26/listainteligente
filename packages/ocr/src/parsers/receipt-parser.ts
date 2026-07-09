import { BaseParser } from "./base";
import type { ReceiptResult, ReceiptItem } from "../types";

interface LineClassification {
  type: "header" | "product" | "total" | "subtotal" | "discount" | "payment" | "ignored";
}

const HEADER_PATTERNS = [
  /cupom\s+fiscal/i, /cnpj/i, /cpf/i, /ie\s/i, /imposto/i,
  /data/i, /hora/i, /item/i, /qtd/i, /un/i, /preço|preco/i,
  /código|codigo/i, /ean/i, /descrição|descricao/i, /valor/i,
];

const TOTAL_PATTERNS = [
  /total\b.*r?\$/i, /r?\$.*total\b/i, /valor\s+a?\s*pagar/i,
  /total\s+geral/i, /total\b/i,
];

const SUBTOTAL_PATTERNS = [
  /subtotal/i, /sub-total/i,
];

const DISCOUNT_PATTERNS = [
  /desconto/i, /desc\b/i,
];

const PAYMENT_PATTERNS = [
  /dinheiro/i, /cartão|cartao/i, /crédito|credito/i, /débito|debito/i,
  /pix/i, /vale/i, /troco/i, /recebido/i, /cheque/i,
];

const IGNORE_PATTERNS = [
  /^[\s\d\-\/\.:]+$/, /^[\s\-]+$/, /^[\s\.]+$/,
  /n[f°\s]?\s*\d+/i, /protocolo/i, /observação|observacao|obs[.:]/i,
  /sac\b/i, /telefone/i, /site/i, /www\./i, /@/,
  /obrigado/i, /volte\s+sempre/i, /documento/i,
  /numero\s+do\s+caixa/i, /operador/i, /cupom\s+fiscal/i,
  /via\s+cliente/i, /consulte\s+o\s+site/i,
];

export class ReceiptParser extends BaseParser<ReceiptResult> {
  canParse(text: string): boolean {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const itemLines = lines.filter((l) => this.extractPrice(l) !== null);
    const hasTotal = lines.some(
      (l) => TOTAL_PATTERNS.some((p) => p.test(l)) && this.extractPrice(l) !== null,
    );

    if (itemLines.length >= 3) return true;
    if (itemLines.length >= 1 && hasTotal) return true;

    const totalLines = lines.filter(
      (l) => TOTAL_PATTERNS.some((p) => p.test(l)),
    ).length;

    return totalLines >= 1 && lines.length >= 5;
  }

  parse(text: string, confidence: number): ReceiptResult {
    const rawLines = text.split("\n");
    const lines = rawLines.map((l) => this.cleanText(l));

    let supermarketName: string | null = null;
    let date: string | null = null;
    let total: number | null = null;
    const items: ReceiptItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const trimmed = line.trim();
      if (!trimmed) continue;

      const classification = this.classifyLine(trimmed, i);

      if (classification.type === "ignored") continue;

      if (!supermarketName && i < 4 && this.isValidEstablishmentLine(trimmed)) {
        supermarketName = trimmed;
      }

      if (!date) {
        const extractedDate = this.extractDate(trimmed);
        if (extractedDate) {
          date = extractedDate;
        }
      }

      if (classification.type === "total" && total === null) {
        total = this.extractPrice(trimmed);
        continue;
      }

      if (classification.type === "discount") continue;

      if (classification.type === "subtotal") continue;

      if (classification.type === "header") continue;

      if (classification.type === "payment") continue;

      if (classification.type === "product") {
        const item = this.parseProductLine(trimmed, i);
        if (item) {
          items.push(item);
        }
      }
    }

    this.dedupItems(items);

    return {
      supermarketName,
      date,
      total,
      items,
      rawText: text,
      confidence,
    };
  }

  private classifyLine(line: string, _index: number): LineClassification {
    if (IGNORE_PATTERNS.some((p) => p.test(line))) {
      return { type: "ignored" };
    }

    if (DISCOUNT_PATTERNS.some((p) => p.test(line))) {
      return { type: "discount" };
    }

    if (TOTAL_PATTERNS.some((p) => p.test(line))) {
      return { type: "total" };
    }

    if (SUBTOTAL_PATTERNS.some((p) => p.test(line))) {
      return { type: "subtotal" };
    }

    if (PAYMENT_PATTERNS.some((p) => p.test(line))) {
      return { type: "payment" };
    }

    if (HEADER_PATTERNS.some((p) => p.test(line)) && this.extractPrice(line) === null) {
      return { type: "header" };
    }

    const price = this.extractPrice(line);
    if (price !== null) {
      const lineWithoutPrice = line
        .replace(/R?\$?\s*[\d.,]+\s*/g, "")
        .replace(/\d+[,.]\d{2}/g, "")
        .trim();

      if (lineWithoutPrice.length >= 2) {
        return { type: "product" };
      }
    }

    return { type: "ignored" };
  }

  private parseProductLine(line: string, index: number): ReceiptItem | null {
    const price = this.extractPrice(line);
    if (price === null) return null;

    const quantity = this.extractLineQuantity(line);
    const name = this.extractItemName(line, price, quantity);

    if (!name) return null;
    if (this.isHeaderOrTotal(name)) return null;

    return {
      name,
      price,
      quantity,
      lineIndex: index,
    };
  }

  private extractLineQuantity(line: string): number {
    const quantityPatterns = [
      /(\d+)\s*[xX\*]\s*\d+[,.]\d{2}/,
      /(\d+)\s*(?:kg|g|l|ml|un)\s+\d+[,.]\d{2}/i,
      /^(\d+)\s{2,}/,
    ];

    for (const pattern of quantityPatterns) {
      const match = line.match(pattern);
      if (match?.[1]) {
        const qty = Number.parseInt(match[1], 10);
        if (!Number.isNaN(qty) && qty > 0 && qty < 100) return qty;
      }
    }

    return 1;
  }

  private isHeaderOrTotal(name: string): boolean {
    const lower = name.toLowerCase();
    const nonProduct = [
      "total", "subtotal", "desconto", "troco", "dinheiro",
      "cartão", "cartao", "crédito", "credito", "débito", "debito",
      "pix", "recebido", "cheque", "vale", "cupom", "cnpj", "cpf",
    ];

    for (const word of nonProduct) {
      if (lower === word || lower.startsWith(word + " ")) return true;
    }

    return false;
  }

  private isValidEstablishmentLine(line: string): boolean {
    if (line.length < 4 || line.length > 80) return false;
    if (/R?\$[\d.,]/.test(line)) return false;
    if (/^\d/.test(line) && !/^\d{2}\/\d{2}/.test(line)) return false;
    if (IGNORE_PATTERNS.some((p) => p.test(line))) return false;
    if (HEADER_PATTERNS.some((p) => p.test(line))) return false;

    return true;
  }

  private extractDate(line: string): string | null {
    const patterns = [
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{2}\/\d{2}\/\d{2})/,
      /(\d{4}-\d{2}-\d{2})/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  private extractItemName(line: string, _price: number, quantity: number): string | null {
    let name = line;

    if (quantity > 1) {
      name = name.replace(new RegExp(`^\\s*${quantity}\\s*[xX\\*]?\\s*`), "");
    }

    name = name
      .replace(/^[\d\s]+/, "")
      .replace(/R?\$?\s*[\d.,]+\s*/g, "")
      .replace(/\d+[,.]\d{2}/g, "")
      .replace(/\s*(\d+)\s*(?:kg|g|l|ml|un)\b/i, " ")
      .trim();

    name = name
      .replace(/\s+/g, " ")
      .trim();

    if (name.length < 2) return null;

    const cleaned = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return cleaned;
  }

  private dedupItems(items: ReceiptItem[]): void {
    const seen = new Set<string>();

    for (let i = items.length - 1; i >= 0; i--) {
      const key = items[i]!.name.toLowerCase();

      if (seen.has(key)) {
        const existingIndex = items.findIndex(
          (item) => item.name.toLowerCase() === key,
        );

        if (existingIndex >= 0 && existingIndex !== i) {
          items[existingIndex]!.price += items[i]!.price;
          items.splice(i, 1);
        }
      } else {
        seen.add(key);
      }
    }
  }
}
