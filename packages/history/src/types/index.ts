export type PurchaseOrigin = "manual" | "ocr_label" | "ocr_receipt";

export interface HistoryFilter {
  search?: string;
  supermarketId?: string;
  startDate?: string;
  endDate?: string;
  origin?: PurchaseOrigin;
  minValue?: number;
  maxValue?: number;
  sortBy?: "date" | "total" | "supermarket";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PurchaseSummary {
  id: string;
  date: string;
  supermarketName: string | null;
  supermarketSlug: string | null;
  totalAmount: number;
  itemCount: number;
  origin: PurchaseOrigin;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string | null;
}

export interface PurchaseDetail {
  id: string;
  date: string;
  supermarketName: string | null;
  supermarketId: string | null;
  totalAmount: number;
  taxAmount: number | null;
  paymentMethod: string | null;
  origin: PurchaseOrigin;
  items: PurchaseItem[];
  rawText: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReopenResult {
  listId: string;
  listName: string;
  itemCount: number;
}

export type ExportFormat = "json" | "csv";
