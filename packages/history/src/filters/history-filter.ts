import type { HistoryFilter, PaginatedResult } from "../types";

interface QueryParams {
  search?: string;
  supermarketId?: string;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  from: number;
  to: number;
}

export class HistoryFilterBuilder {
  build(params: HistoryFilter): QueryParams {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));

    return {
      search: params.search?.trim() || undefined,
      supermarketId: params.supermarketId || undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      minValue: params.minValue !== undefined ? params.minValue : undefined,
      maxValue: params.maxValue !== undefined ? params.maxValue : undefined,
      sortBy: params.sortBy ?? "date",
      sortOrder: params.sortOrder ?? "desc",
      from: (page - 1) * pageSize,
      to: page * pageSize - 1,
    };
  }

  buildPaginatedResult<T>(
    data: T[],
    total: number,
    params: HistoryFilter,
  ): PaginatedResult<T> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
