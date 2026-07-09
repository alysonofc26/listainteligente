import { HistoryRepository } from "../repositories/history-repository";
import { HistoryMapper } from "../mappers/history-mapper";
import type {
  HistoryFilter,
  PurchaseSummary,
  PurchaseDetail,
  PaginatedResult,
  ReopenResult,
} from "../types";

export class HistoryService {
  private readonly repository: HistoryRepository;
  private readonly mapper: HistoryMapper;

  constructor(supabase: any) {
    this.repository = new HistoryRepository(supabase);
    this.mapper = new HistoryMapper();
  }

  async list(
    userId: string,
    filter: HistoryFilter = {},
  ): Promise<PaginatedResult<PurchaseSummary>> {
    const { data, total } = await this.repository.list(userId, filter);

    const summaries = data.map((row) => this.mapper.toSummary(row));

    const page = Math.max(1, filter.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filter.pageSize ?? 20));

    return {
      data: summaries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getDetail(userId: string, receiptId: string): Promise<PurchaseDetail | null> {
    const data = await this.repository.getById(userId, receiptId);

    if (!data) return null;

    return this.mapper.toDetail(data);
  }

  async delete(userId: string, receiptId: string): Promise<void> {
    await this.repository.delete(userId, receiptId);
  }

  async reopen(
    userId: string,
    receiptId: string,
    listName?: string,
  ): Promise<ReopenResult> {
    const detail = await this.repository.getById(userId, receiptId);

    if (!detail) {
      throw new Error("Cupom não encontrado.");
    }

    const supermarketLabel = detail.supermarket?.name ?? "Compra";
    const dateLabel = detail.receipt_date
      ? new Date(detail.receipt_date).toLocaleDateString("pt-BR")
      : "";
    const name =
      listName?.trim() || `Reabertura - ${supermarketLabel}${dateLabel ? ` - ${dateLabel}` : ""}`;

    const result = await this.repository.reopen(userId, receiptId, name);

    return {
      listId: result.listId,
      listName: name,
      itemCount: result.itemCount,
    };
  }

  async getSupermarkets(
    userId: string,
  ): Promise<Array<{ id: string; name: string }>> {
    return await this.repository.listSupermarkets(userId);
  }
}
