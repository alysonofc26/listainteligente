import type { BaseEntity } from "./common";

export interface Product extends BaseEntity {
  name: string;
  brand: string | null;
  category: string | null;
  barcode: string | null;
  image_url: string | null;
  unit: string | null;
}

export interface ProductWithPrice extends Product {
  current_price: number | null;
  supermarket_id: string | null;
  supermarket_name: string | null;
}
