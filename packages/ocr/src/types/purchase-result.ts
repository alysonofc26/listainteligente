export interface PurchaseItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string | null;
  normalizedName: string;
  originalName: string;
}

export interface PurchaseMetadata {
  supermarketName: string | null;
  date: string | null;
  totalAmount: number;
  subtotal: number;
  taxAmount: number | null;
  paymentMethod: string | null;
  itemCount: number;
  confidence: number;
  rawText: string;
}

export interface ValidationResult {
  field: string;
  status: "ok" | "warning" | "error";
  message: string;
}

export interface PurchaseResult {
  metadata: PurchaseMetadata;
  items: PurchaseItem[];
  validations: ValidationResult[];
  normalized: boolean;
}
