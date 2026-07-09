import type { PurchaseDetail } from "../types";

export type ExportFormat = "json" | "csv";

export class HistoryExporter {
  exportToJson(details: PurchaseDetail[]): string {
    const data = details.map((d) => ({
      id: d.id,
      date: d.date,
      supermarket: d.supermarketName,
      total: d.totalAmount,
      tax: d.taxAmount,
      payment: d.paymentMethod,
      origin: d.origin,
      items: d.items.map((i) => ({
        product: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        category: i.category,
      })),
    }));

    return JSON.stringify(data, null, 2);
  }

  exportToCsv(details: PurchaseDetail[]): string {
    const lines: string[] = [
      "ID,Data,Supermercado,Total,Produto,Quantidade,PrecoUnitario,PrecoTotal,Categoria",
    ];

    for (const detail of details) {
      const base = [
        detail.id,
        detail.date,
        `"${detail.supermarketName ?? ""}"`,
        detail.totalAmount.toFixed(2),
      ];

      if (detail.items.length === 0) {
        lines.push([...base, "", "", "", "", ""].join(","));
      } else {
        for (const item of detail.items) {
          lines.push(
            [
              ...base,
              `"${item.productName}"`,
              item.quantity,
              item.unitPrice.toFixed(2),
              item.totalPrice.toFixed(2),
              `"${item.category ?? ""}"`,
            ].join(","),
          );
        }
      }
    }

    return lines.join("\n");
  }

  export(
    details: PurchaseDetail[],
    format: ExportFormat = "json",
  ): string {
    if (format === "csv") return this.exportToCsv(details);
    return this.exportToJson(details);
  }
}
