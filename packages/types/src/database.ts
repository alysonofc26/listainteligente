import type {
  ShoppingList,
  ListItem,
  Product,
  Supermarket,
  ProductPrice,
  Receipt,
  ReceiptItem,
  PriceHistory,
  UserProfile,
} from "./index";

export interface DatabaseSchema {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id">>;
      };
      lists: {
        Row: ShoppingList;
        Insert: Omit<ShoppingList, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ShoppingList, "id">>;
      };
      list_items: {
        Row: ListItem;
        Insert: Omit<ListItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ListItem, "id">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id">>;
      };
      supermarkets: {
        Row: Supermarket;
        Insert: Omit<Supermarket, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Supermarket, "id">>;
      };
      product_prices: {
        Row: ProductPrice;
        Insert: Omit<ProductPrice, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductPrice, "id">>;
      };
      receipts: {
        Row: Receipt;
        Insert: Omit<Receipt, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Receipt, "id">>;
      };
      receipt_items: {
        Row: ReceiptItem;
        Insert: Omit<ReceiptItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ReceiptItem, "id">>;
      };
      price_history: {
        Row: PriceHistory;
        Insert: Omit<PriceHistory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PriceHistory, "id">>;
      };
      favorites: {
        Row: BaseFavorite;
        Insert: Omit<BaseFavorite, "id" | "created_at">;
        Update: Partial<Omit<BaseFavorite, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

interface BaseFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}
