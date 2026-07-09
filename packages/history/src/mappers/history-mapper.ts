import type { PurchaseOrigin, PurchaseSummary, PurchaseDetail, PurchaseItem } from "../types";

interface ReceiptRow {
  id: string;
  receipt_date: string;
  total_amount: number;
  tax_amount: number | null;
  payment_method: string | null;
  receipt_image_url: string | null;
  ocr_raw_text: string | null;
  created_at: string;
  supermarket: { name: string; slug: string } | null;
  receipt_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category: string | null;
  }>;
}

export class HistoryMapper {
  toSummary(row: ReceiptRow): PurchaseSummary {
    return {
      id: row.id,
      date: row.receipt_date,
      supermarketName: row.supermarket?.name ?? null,
      supermarketSlug: row.supermarket?.slug ?? null,
      totalAmount: row.total_amount,
      itemCount: row.receipt_items?.length ?? 0,
      origin: this.detectOrigin(row),
      createdAt: row.created_at,
    };
  }

  toDetail(row: ReceiptRow): PurchaseDetail {
    const items: PurchaseItem[] = (row.receipt_items ?? []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      category: item.category,
    }));

    return {
      id: row.id,
      date: row.receipt_date,
      supermarketName: row.supermarket?.name ?? null,
      supermarketId: null,
      totalAmount: row.total_amount,
      taxAmount: row.tax_amount,
      paymentMethod: row.payment_method,
      origin: this.detectOrigin(row),
      items,
      rawText: row.ocr_raw_text,
      imageUrl: row.receipt_image_url,
      createdAt: row.created_at,
    };
  }

  private detectOrigin(row: ReceiptRow): PurchaseOrigin {
    if (row.receipt_image_url) return "ocr_receipt";
    if (row.ocr_raw_text) return "ocr_receipt";
    return "manual";
  }
}
