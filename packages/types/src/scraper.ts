export interface ProductResult {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  unitPrice: number | null;
  image: string | null;
  url: string;
  availability: boolean;
  updatedAt: string;
}

export interface SearchResult {
  products: ProductResult[];
  total: number;
  query: string;
  supermarket: string;
}
