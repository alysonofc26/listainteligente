import { BaseRepository } from "./base";
import type { Tables } from "types";

export class ReceiptsRepository extends BaseRepository<"receipts"> {
  protected readonly tableName = "receipts";

  async findByUserId(userId: string): Promise<Tables<"receipts">[]> {
    const { data } = await this.client
      .from("receipts")
      .select("*")
      .eq("user_id", userId)
      .order("receipt_date", { ascending: false });

    return data ?? [];
  }

  async getReceiptItems(
    receiptId: string,
  ): Promise<Tables<"receipt_items">[]> {
    const { data } = await this.client
      .from("receipt_items")
      .select("*")
      .eq("receipt_id", receiptId);

    return data ?? [];
  }

  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Tables<"receipts">[]> {
    const { data } = await this.client
      .from("receipts")
      .select("*")
      .eq("user_id", userId)
      .gte("receipt_date", startDate)
      .lte("receipt_date", endDate)
      .order("receipt_date", { ascending: false });

    return data ?? [];
  }

  async getMonthlyTotal(
    userId: string,
    year: number,
    month: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0).toISOString();

    const { data } = await this.client
      .from("receipts")
      .select("total_amount")
      .eq("user_id", userId)
      .gte("receipt_date", startDate)
      .lte("receipt_date", endDate);

    return (
      data?.reduce((sum, r) => sum + (r.total_amount ?? 0), 0) ?? 0
    );
  }
}
