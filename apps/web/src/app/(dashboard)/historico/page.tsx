"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  Calendar,
  ArrowUpDown,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  DollarSign,
} from "lucide-react";
import {
  listPurchases,
  deletePurchase,
  reopenPurchase,
  getPurchaseSupermarkets,
} from "@/lib/actions/history";
import type { PurchaseSummary, PaginatedResult } from "history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/shared/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "@/components/ui/use-toast";

interface SupermarketOption {
  id: string;
  name: string;
}

export default function HistoricoPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<PurchaseSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [supermarkets, setSupermarkets] = useState<SupermarketOption[]>([]);

  const [search, setSearch] = useState("");
  const [supermarketId, setSupermarketId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const pageSize = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchases, supermarketsData] = await Promise.all([
        listPurchases({
          search: search || undefined,
          supermarketId: supermarketId !== "all" ? supermarketId : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          minValue: minValue ? Number(minValue) : undefined,
          maxValue: maxValue ? Number(maxValue) : undefined,
          sortBy,
          sortOrder,
          page,
          pageSize,
        }),
        getPurchaseSupermarkets(),
      ]);

      setResult(purchases);
      setSupermarkets(supermarketsData);
    } catch {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, supermarketId, startDate, endDate, minValue, maxValue, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSearch() {
    setPage(1);
    loadData();
  }

  function handleResetFilters() {
    setSearch("");
    setSupermarketId("all");
    setStartDate("");
    setEndDate("");
    setMinValue("");
    setMaxValue("");
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
    setShowFilters(false);
  }

  function handleSortChange(value: string) {
    if (value === "date_desc") { setSortBy("date"); setSortOrder("desc"); }
    else if (value === "date_asc") { setSortBy("date"); setSortOrder("asc"); }
    else if (value === "total_desc") { setSortBy("total"); setSortOrder("desc"); }
    else if (value === "total_asc") { setSortBy("total"); setSortOrder("asc"); }
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta compra?")) return;

    try {
      await deletePurchase(id);
      toast({ title: "Compra excluída", description: "Registro removido do histórico." });
      loadData();
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a compra.",
        variant: "destructive",
      });
    }
  }

  async function handleReopen(id: string) {
    try {
      const result = await reopenPurchase(id);
      toast({
        title: "Lista criada",
        description: `"${result.listName}" criada com ${result.itemCount} itens.`,
      });
      router.push(`/minha-lista/${result.listId}`);
    } catch {
      toast({
        title: "Erro ao reabrir",
        description: "Não foi possível reabrir a compra.",
        variant: "destructive",
      });
    }
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const sortValue = `${sortBy}_${sortOrder}`;
  const hasActiveFilters =
    search || supermarketId !== "all" || startDate || endDate || minValue || maxValue;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground">
            Acompanhe todo o histórico de suas compras.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Compras realizadas
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-48 pl-9"
                />
              </div>

              <Select value={sortValue} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Mais recentes</SelectItem>
                  <SelectItem value="date_asc">Mais antigos</SelectItem>
                  <SelectItem value="total_desc">Maior valor</SelectItem>
                  <SelectItem value="total_asc">Menor valor</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-muted/30 p-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Supermercado</label>
                <Select value={supermarketId} onValueChange={setSupermarketId}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {supermarkets.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Data início</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Data fim</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Valor min</label>
                <Input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} placeholder="R$ 0" className="w-28" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Valor max</label>
                <Input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} placeholder="R$ 999" className="w-28" />
              </div>

              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <X className="mr-1 h-3 w-3" />
                Limpar
              </Button>

              <Button size="sm" onClick={() => { setPage(1); loadData(); }}>
                Aplicar
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : !result || result.data.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={History}
                title="Nenhuma compra encontrada"
                description={
                  hasActiveFilters
                    ? "Nenhum resultado para os filtros aplicados."
                    : "Suas compras aparecerão aqui após o primeiro escaneamento de cupom fiscal."
                }
                action={
                  !hasActiveFilters ? undefined : (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Limpar filtros
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="space-y-2">
              {result.data.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/historico/${purchase.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {purchase.supermarketName ?? "Supermercado"}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {purchase.itemCount} {purchase.itemCount === 1 ? "item" : "itens"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(purchase.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(purchase.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReopen(purchase.id)}
                      title="Reabrir compra"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {result && result.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                Página {result.page} de {result.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= result.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
