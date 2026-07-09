export interface OCRResult {
  text: string;
  confidence: number;
  items: OCRItem[];
}

export interface OCRItem {
  name: string | null;
  price: number | null;
  quantity: number | null;
  unit: string | null;
  confidence: number;
  raw_text: string;
}

export interface OCRReceiptResult {
  text: string;
  confidence: number;
  supermarket_name: string | null;
  date: string | null;
  total: number | null;
  items: OCRItem[];
}
