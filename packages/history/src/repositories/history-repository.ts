import { HistoryFilterBuilder } from "../filters/history-filter";
import type { HistoryFilter } from "../types";

interface ReceiptRow {
  id: string;
  receipt_date: string;
  total_amount: number;
  tax_amount: number | null;
  payment_method: string | null;
  receipt_image_url: string | null;
  ocr_raw_text: string | null;
  created_at: string;
  supermarket: { name: string; slug: string } | null;
  receipt_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category: string | null;
  }>;
}

type SupabaseClient = any;

export class HistoryRepository {
  private readonly supabase: SupabaseClient;
  private readonly filterBuilder: HistoryFilterBuilder;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.filterBuilder = new HistoryFilterBuilder();
  }

  async list(
    userId: string,
    filter: HistoryFilter,
  ): Promise<{ data: ReceiptRow[]; total: number }> {
    const params = this.filterBuilder.build(filter);

    let query = this.supabase
      .from("receipts")
      .select(
        `id, receipt_date, total_amount, tax_amount, payment_method, receipt_image_url, ocr_raw_text, created_at,
        supermarket:supermarkets(id, name, slug),
        receipt_items(id, product_name, quantity, unit_price, total_price, category)`,
        { count: "exact", head: false },
      )
      .eq("user_id", userId);

    if (params.supermarketId) {
      query = query.eq("supermarket_id", params.supermarketId);
    }

    if (params.startDate) {
      query = query.gte("receipt_date", params.startDate);
    }

    if (params.endDate) {
      query = query.lte("receipt_date", params.endDate);
    }

    if (params.minValue !== undefined) {
      query = query.gte("total_amount", params.minValue);
    }

    if (params.maxValue !== undefined) {
      query = query.lte("total_amount", params.maxValue);
    }

    if (params.search) {
      query = query.ilike("receipt_items.product_name", `%${params.search}%`);
    }

    const sortAsc = params.sortOrder === "asc";
    const sortColumn = params.sortBy === "total" ? "total_amount" : "receipt_date";

    query = query.order(sortColumn, { ascending: sortAsc });
    query = query.range(params.from, params.to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data ?? []) as ReceiptRow[],
      total: count ?? 0,
    };
  }

  async getById(
    userId: string,
    receiptId: string,
  ): Promise<ReceiptRow | null> {
    const { data, error } = await this.supabase
      .from("receipts")
      .select(
        `id, receipt_date, total_amount, tax_amount, payment_method, receipt_image_url, ocr_raw_text, created_at,
        supermarket:supermarkets(id, name, slug),
        receipt_items(id, product_name, quantity, unit_price, total_price, category)`,
      )
      .eq("user_id", userId)
      .eq("id", receiptId)
      .maybeSingle();

    if (error) throw error;
    return data as ReceiptRow | null;
  }

  async delete(userId: string, receiptId: string): Promise<void> {
    const { error } = await this.supabase
      .from("receipts")
      .delete()
      .eq("user_id", userId)
      .eq("id", receiptId);

    if (error) throw error;
  }

  async listSupermarkets(userId: string): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await this.supabase
      .from("receipts")
      .select("supermarket_id, supermarket:supermarkets(id, name)")
      .eq("user_id", userId)
      .not("supermarket_id", "is", null);

    if (error) throw error;

    const seen = new Set<string>();
    const result: Array<{ id: string; name: string }> = [];

    for (const row of data ?? []) {
      const market = row.supermarket as { id: string; name: string } | null;
      if (market && !seen.has(market.id)) {
        seen.add(market.id);
        result.push(market);
      }
    }

    return result;
  }

  async reopen(
    userId: string,
    receiptId: string,
    listName: string,
  ): Promise<{ listId: string; itemCount: number }> {
    const receipt = await this.getById(userId, receiptId);

    if (!receipt) {
      throw new Error("Cupom não encontrado.");
    }

    const { data: listData, error: listError } = await this.supabase
      .from("lists")
      .insert({
        user_id: userId,
        name: listName,
        is_active: true,
        total_estimated: receipt.total_amount,
      })
      .select("id")
      .single();

    if (listError) throw listError;

    const items = (receipt.receipt_items ?? []).map((item) => ({
      list_id: listData.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit: "un",
      estimated_price: item.unit_price,
      notes: item.category ? `Categoria: ${item.category}` : null,
    }));

    if (items.length > 0) {
      const { error: itemsError } = await this.supabase
        .from("list_items")
        .insert(items);

      if (itemsError) throw itemsError;
    }

    return {
      listId: listData.id,
      itemCount: items.length,
    };
  }
}
