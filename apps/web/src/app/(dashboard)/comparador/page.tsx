"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingDown,
  Store,
  Package,
  PiggyBank,
  AlertCircle,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { compareFullList } from "@/lib/actions/comparador";
import type { SummaryAiResult } from "@/lib/actions/comparador";
import { Button } from "@/components/ui/button";

function currency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ComparadorPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<SummaryAiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await compareFullList();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao comparar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  if (loading) return <ComparadorSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comparador</h1>
          <p className="text-muted-foreground">
            Compare preços entre supermercados e encontre o melhor lugar para comprar.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
            <div className="text-center">
              <p className="font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione produtos à sua lista ativa e tente novamente.
              </p>
            </div>
            <Button onClick={fetchComparison} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) return null;

  const { comparison, aiRecommendation } = result;

  const summaryCards = [
    {
      title: "Economia Potencial",
      value: currency(comparison.totalSavings),
      description: `${comparison.savingsPercentage.toFixed(1)}% de economia`,
      icon: PiggyBank,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Produtos Encontrados",
      value: `${comparison.productsFound}/${comparison.totalItems}`,
      description: `${comparison.productsNotFound} não encontrado(s)`,
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Supermercados",
      value: String(comparison.supermarketsConsulted.length),
      description: "consultados",
      icon: Store,
      color: "text-violet-600 bg-violet-100",
    },
    {
      title: "Melhor Supermercado",
      value: comparison.bestSupermarket?.supermarketName ?? "-",
      description: comparison.bestSupermarket
        ? `Economia de ${currency(comparison.bestSupermarket.savings)}`
        : "Nenhum disponível",
      icon: ShoppingCart,
      color: "text-amber-600 bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comparador Inteligente</h1>
          <p className="text-muted-foreground">
            {user?.email?.split("@")[0] ?? "Usuário"}, veja onde comprar cada produto pelo menor preço.
          </p>
        </div>
        <Button onClick={fetchComparison} variant="outline" size="sm" className="gap-2" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {comparison.totalSavings > 0 && comparison.bestSupermarket && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CardContent className="flex items-center gap-4 py-4">
            <TrendingDown className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                Comprando no {comparison.bestSupermarket.supermarketName}, você economiza{" "}
                {currency(comparison.bestSupermarket.savings)} em relação ao maior preço.
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Economia total potencial: {currency(comparison.totalSavings)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {aiRecommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Recomendações Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {aiRecommendation.split("\n").map((line, i) => (
                <p key={i} className={line.startsWith("-") ? "ml-4" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-muted-foreground" />
            Comparação por Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium">Produto</th>
                {comparison.supermarketsConsulted.map((sid) => (
                  <th key={sid} className="pb-3 font-medium px-2">
                    {getSupermarketLabel(sid)}
                  </th>
                ))}
                <th className="pb-3 font-medium px-2 text-right">Melhor Preço</th>
                <th className="pb-3 font-medium px-2 text-right">Economia</th>
              </tr>
            </thead>
            <tbody>
              {comparison.items.map((item) => {
                const hasLowest = item.lowestPrice > 0;
                return (
                  <tr key={item.productName} className="border-b last:border-0">
                    <td className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {item.productName}
                        {!hasLowest && (
                          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.quantity}x {item.unit}
                      </span>
                    </td>
                    {comparison.supermarketsConsulted.map((sid) => {
                      const priceData = item.prices.find(
                        (p) => p.supermarketId === sid,
                      );
                      const isLowest =
                        priceData &&
                        priceData.supermarketId === item.lowestSupermarketId;
                      return (
                        <td key={sid} className="py-3 px-2">
                          {priceData ? (
                            <span
                              className={
                                isLowest
                                  ? "font-bold text-emerald-600"
                                  : "text-foreground"
                              }
                            >
                              {currency(priceData.price)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-2 text-right font-bold text-emerald-600">
                      {hasLowest ? currency(item.lowestPrice) : "—"}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {item.potentialSavings > 0 ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          -{currency(item.potentialSavings)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4 text-muted-foreground" />
              Resumo por Supermercado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison.bySupermarket.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum supermercado com produtos disponíveis.
              </p>
            ) : (
              comparison.bySupermarket.map((s) => {
                const maxTotal = Math.max(
                  ...comparison.bySupermarket.map((x) => x.total),
                );
                return (
                  <div key={s.supermarketId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.supermarketName}</span>
                      <span className="text-muted-foreground">
                        {currency(s.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${
                              maxTotal > 0
                                ? (s.total / maxTotal) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {s.availableItems} disponível(is)
                      </span>
                      {s.unavailableItems > 0 && (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-destructive" />
                          {s.unavailableItems} indisponível(is)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              Produtos Não Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comparison.productsNotFound === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todos os produtos foram encontrados em pelo menos um supermercado.
              </p>
            ) : (
              <ul className="space-y-2">
                {comparison.items
                  .filter((item) => item.prices.length === 0)
                  .map((item) => (
                    <li
                      key={item.productName}
                      className="flex items-center gap-2 text-sm"
                    >
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                      <span>{item.productName}</span>
                      <span className="text-xs text-muted-foreground">
                        ({item.quantity}x {item.unit})
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getSupermarketLabel(slug: string): string {
  const labels: Record<string, string> = {
    carrefour: "Carrefour",
    assai: "Assaí",
    atacadao: "Atacadão",
    paodeacucar: "Pão de Açúcar",
  };
  return labels[slug] ?? slug;
}

function ComparadorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-7 w-24" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
