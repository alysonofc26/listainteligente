import type { BaseEntity } from "./common";

export interface Receipt extends BaseEntity {
  user_id: string;
  supermarket_id: string | null;
  total_amount: number;
  tax_amount: number | null;
  payment_method: string | null;
  receipt_date: string;
  receipt_image_url: string | null;
  ocr_raw_text: string | null;
}

export interface ReceiptItem extends BaseEntity {
  receipt_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string | null;
}
