import type { ValidationResult } from "../types/purchase-result";

interface ValidationInput {
  supermarketName: string | null;
  date: string | null;
  total: number | null;
  items: Array<{ price: number }>;
  rawText: string;
}

function isValidDate(dateStr: string): boolean {
  const patterns = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    /^(\d{4})-(\d{2})-(\d{2})$/,
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      let year: number, month: number, day: number;
      if (pattern === patterns[0]) {
        day = Number.parseInt(match[1]!, 10);
        month = Number.parseInt(match[2]!, 10);
        year = Number.parseInt(match[3]!, 10);
      } else {
        year = Number.parseInt(match[1]!, 10);
        month = Number.parseInt(match[2]!, 10);
        day = Number.parseInt(match[3]!, 10);
      }

      if (year < 2000 || year > 2100) return false;
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;

      return true;
    }
  }
  return false;
}

export class ReceiptValidator {
  validate(input: ValidationInput): ValidationResult[] {
    const results: ValidationResult[] = [];

    results.push(this.validateDate(input.date));
    results.push(this.validateItems(input.items));
    results.push(this.validateTotals(input.items, input.total, input.rawText));
    results.push(this.validateEstablishment(input.supermarketName));

    return results;
  }

  private validateDate(date: string | null): ValidationResult {
    if (!date) {
      return {
        field: "date",
        status: "warning",
        message: "Data do cupom não identificada.",
      };
    }

    if (!isValidDate(date)) {
      return {
        field: "date",
        status: "warning",
        message: `Data "${date}" parece inválida.`,
      };
    }

    return {
      field: "date",
      status: "ok",
      message: `Data do cupom: ${date}`,
    };
  }

  private validateItems(
    items: Array<{ price: number }>,
  ): ValidationResult {
    if (items.length === 0) {
      return {
        field: "items",
        status: "error",
        message: "Nenhum item foi identificado no cupom.",
      };
    }

    const itemsWithoutPrice = items.filter((i) => i.price <= 0).length;
    if (itemsWithoutPrice > 0) {
      return {
        field: "items",
        status: "warning",
        message: `${itemsWithoutPrice} item(ns) sem preço identificado.`,
      };
    }

    return {
      field: "items",
      status: "ok",
      message: `${items.length} itens identificados.`,
    };
  }

  private validateTotals(
    items: Array<{ price: number }>,
    total: number | null,
    rawText: string,
  ): ValidationResult {
    if (items.length === 0) {
      return {
        field: "total",
        status: "warning",
        message: "Total não pode ser verificado sem itens.",
      };
    }

    if (total === null) {
      return {
        field: "total",
        status: "warning",
        message: "Total do cupom não identificado.",
      };
    }

    const itemsTotal = Math.round(
      items.reduce((sum, item) => sum + item.price, 0) * 100,
    ) / 100;

    const totalRounded = Math.round(total * 100) / 100;
    const diff = Math.abs(itemsTotal - totalRounded);

    if (diff > 1) {
      const hasDiscount = /desconto|desc/i.test(rawText);
      if (hasDiscount) {
        return {
          field: "total",
          status: "warning",
          message: `Total (R$ ${totalRounded.toFixed(2)}) difere da soma dos itens (R$ ${itemsTotal.toFixed(2)}). Cupom pode conter descontos não identificados.`,
        };
      }

      return {
        field: "total",
        status: "error",
        message: `Total (R$ ${totalRounded.toFixed(2)}) não corresponde à soma dos itens (R$ ${itemsTotal.toFixed(2)}).`,
      };
    }

    return {
      field: "total",
      status: "ok",
      message: `Total de R$ ${totalRounded.toFixed(2)} confirmado.`,
    };
  }

  private validateEstablishment(
    supermarketName: string | null,
  ): ValidationResult {
    if (!supermarketName) {
      return {
        field: "establishment",
        status: "warning",
        message: "Estabelecimento não identificado no cupom.",
      };
    }

    return {
      field: "establishment",
      status: "ok",
      message: `Estabelecimento: ${supermarketName}`,
    };
  }
}
