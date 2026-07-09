import type { BaseEntity } from "./common";

export interface Supermarket extends BaseEntity {
  name: string;
  slug: string;
  logo_url: string | null;
  color: string | null;
  website: string | null;
  is_active: boolean;
}

export interface ProductPrice extends BaseEntity {
  product_id: string;
  supermarket_id: string;
  price: number;
  price_per_unit: number | null;
  currency: string;
  is_promotion: boolean;
  promotion_label: string | null;
  url: string | null;
  scraped_at: string | null;
}
