import type { BaseEntity } from "./common";

export interface ShoppingList extends BaseEntity {
  user_id: string;
  name: string;
  is_active: boolean;
  total_estimated: number | null;
}

export interface ListItem extends BaseEntity {
  list_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  estimated_price: number | null;
  checked: boolean;
  notes: string | null;
}
