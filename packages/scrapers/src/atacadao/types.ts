export interface AtacadaoParsedProduct {
  name: string;
  brand: string | null;
  price: number | null;
  unitPrice: number | null;
  unit: string | null;
  imageUrl: string | null;
  productUrl: string;
  isPromotion: boolean;
  promotionLabel: string | null;
  category: string | null;
  sku: string | null;
}
