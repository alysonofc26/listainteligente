import type { AiContext, AiContextItem } from "../types";
import { formatCurrency } from "shared";

export class ContextBuilder {
  build(context: AiContext): string {
    const sections: string[] = [];

    sections.push(`Lista: ${context.listName}`);
    sections.push(`Total de itens: ${context.itemCount}`);
    sections.push(`Valor total: ${formatCurrency(context.total)}`);

    if (context.budget !== undefined) {
      sections.push(`Orçamento definido: ${formatCurrency(context.budget)}`);
    }

    if (context.supermarket) {
      sections.push(`Supermercado: ${context.supermarket}`);
    }

    if (context.items.length > 0) {
      sections.push("");
      sections.push("## Itens da lista");
      sections.push("");

      const sorted = [...context.items].sort(
        (a, b) => (b.price ?? 0) * b.quantity - (a.price ?? 0) * a.quantity,
      );

      for (const item of sorted) {
        sections.push(this.formatItem(item));
      }
    }

    const categoryBreakdown = this.buildCategoryBreakdown(context.items);
    if (categoryBreakdown.length > 0) {
      sections.push("");
      sections.push("## Gastos por categoria");
      for (const line of categoryBreakdown) {
        sections.push(line);
      }
    }

    return sections.join("\n");
  }

  private formatItem(item: AiContextItem): string {
    const parts: string[] = [`- ${item.name}`];

    if (item.quantity > 1) {
      parts.push(`Qtd: ${item.quantity}`);
    }

    if (item.price !== null) {
      const total = item.price * item.quantity;
      parts.push(`Preço: ${formatCurrency(item.price)}`);
      if (item.quantity > 1) {
        parts.push(`Total: ${formatCurrency(total)}`);
      }
    } else {
      parts.push("Preço: não informado");
    }

    if (item.unitPrice !== null) {
      parts.push(`Preço unitário: ${formatCurrency(item.unitPrice)}`);
    }

    if (item.category) {
      parts.push(`Categoria: ${item.category}`);
    }

    if (item.brand) {
      parts.push(`Marca: ${item.brand}`);
    }

    return parts.join(" | ");
  }

  private buildCategoryBreakdown(items: AiContextItem[]): string[] {
    const byCategory = new Map<string, number>();

    for (const item of items) {
      const cat = item.category ?? "Sem categoria";
      const total = (item.price ?? 0) * item.quantity;
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + total);
    }

    if (byCategory.size <= 1) return [];

    const sorted = Array.from(byCategory.entries()).sort(
      (a, b) => b[1] - a[1],
    );

    return sorted.map(
      ([cat, total]) => `- ${cat}: ${formatCurrency(total)}`,
    );
  }
}
