export interface CarrefourParsedProduct {
  name: string;
  brand: string | null;
  price: number;
  unitPrice: number | null;
  unit: string | null;
  imageUrl: string | null;
  productUrl: string;
  isPromotion: boolean;
  promotionLabel: string | null;
}

export interface CarrefourParsedPage {
  products: CarrefourParsedProduct[];
}
