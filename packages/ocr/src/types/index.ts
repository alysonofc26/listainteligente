export interface OCRRawResult {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRProcessOptions {
  language?: string;
  confidenceThreshold?: number;
  preprocess?: boolean;
}

export interface LabelResult {
  productName: string | null;
  price: number | null;
  quantity: number | null;
  unit: string | null;
  confidence: number;
  rawText: string;
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  lineIndex: number;
}

export interface ReceiptResult {
  supermarketName: string | null;
  date: string | null;
  total: number | null;
  items: ReceiptItem[];
  rawText: string;
  confidence: number;
}

export interface ParsedResult<T = LabelResult | ReceiptResult> {
  type: "label" | "receipt";
  data: T;
  confidence: number;
  rawText: string;
}

export interface Parser<T> {
  canParse(text: string): boolean;
  parse(text: string, confidence: number): T;
}

export type { PurchaseResult, PurchaseItem, PurchaseMetadata, ValidationResult } from "./purchase-result";
