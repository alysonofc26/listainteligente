type SupabaseClient = any;

export class StatisticsRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listReceipts(userId: string): Promise<
    Array<{
      id: string;
      receipt_date: string;
      total_amount: number;
      supermarket: { id: string; name: string } | null;
      receipt_items: Array<{ product_name: string; unit_price: number; quantity: number }>;
    }>
  > {
    const { data, error } = await this.supabase
      .from("receipts")
      .select(
        `id, receipt_date, total_amount,
        supermarket:supermarkets(id, name),
        receipt_items(product_name, unit_price, quantity)`,
      )
      .eq("user_id", userId)
      .order("receipt_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async listReceiptItems(userId: string): Promise<
    Array<{
      total_price: number;
      category: string | null;
      product_name: string;
      unit_price: number;
      quantity: number;
    }>
  > {
    const { data, error } = await this.supabase
      .from("receipt_items")
      .select(
        `total_price, category, product_name, unit_price, quantity,
        receipt:receipts!inner(user_id)`,
      )
      .eq("receipt.user_id", userId);

    if (error) throw error;
    return data ?? [];
  }

  async listAllProductPrices(userId: string): Promise<
    Array<{ productName: string; unitPrice: number }>
  > {
    const items = await this.listReceiptItems(userId);
    return items.map((i) => ({
      productName: i.product_name.toLowerCase(),
      unitPrice: i.unit_price,
    }));
  }

  buildAveragePriceMap(items: Array<{ productName: string; unitPrice: number }>): Map<string, number> {
    const prices = new Map<string, number[]>();

    for (const item of items) {
      const list = prices.get(item.productName) ?? [];
      list.push(item.unitPrice);
      prices.set(item.productName, list);
    }

    const averages = new Map<string, number>();
    for (const [product, values] of prices) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      averages.set(product, Math.round(avg * 100) / 100);
    }

    return averages;
  }

  async listTopProducts(
    userId: string,
    limit: number = 10,
  ): Promise<
    Array<{ productName: string; totalQuantity: number; totalSpent: number; purchaseCount: number }>
  > {
    const items = await this.listReceiptItems(userId);

    const productMap = new Map<
      string,
      { qty: number; spent: number; count: number }
    >();

    for (const item of items) {
      const name = item.product_name.toLowerCase();
      const entry = productMap.get(name) ?? { qty: 0, spent: 0, count: 0 };
      entry.qty += item.quantity;
      entry.spent += item.total_price;
      entry.count += 1;
      productMap.set(name, entry);
    }

    return Array.from(productMap.entries())
      .map(([productName, data]) => ({
        productName,
        totalQuantity: data.qty,
        totalSpent: Math.round(data.spent * 100) / 100,
        purchaseCount: data.count,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }
}
