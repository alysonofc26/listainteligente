"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingDown,
  TrendingUp,
  Receipt,
  BarChart3,
  ShoppingBag,
  Store,
  Package,
  PiggyBank,
  AlertCircle,
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions/dashboard";
import type { DashboardStats } from "statistics";

function currency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Erro ao carregar dados: {error}</p>
      </div>
    );

  const fallback = {
    expenseSummary: {
      totalSpent: 0, monthlyAverage: 0, weeklyAverage: 0, annualTotal: 0,
      averagePerPurchase: 0, highestPurchase: null, lowestPurchase: null,
      monthlyEvolution: [] as DashboardStats["expenseSummary"]["monthlyEvolution"],
      totalPurchases: 0,
    } satisfies DashboardStats["expenseSummary"],
    topCategories: [] as DashboardStats["topCategories"],
    topSupermarkets: [] as DashboardStats["topSupermarkets"],
    economySummary: { totalSaved: 0, bySupermarket: [] as DashboardStats["economySummary"]["bySupermarket"], monthlyAverage: 0, bestMonth: null } satisfies DashboardStats["economySummary"],
    frequencySummary: {
      totalPurchases: 0, averagePerMonth: 0, averagePerWeek: 0, averageTicket: 0,
      daysBetweenPurchases: null, mostFrequentSupermarket: null,
    } satisfies DashboardStats["frequencySummary"],
    topProducts: [] as DashboardStats["topProducts"],
  } satisfies DashboardStats;

  const { expenseSummary, topCategories, topSupermarkets, economySummary, frequencySummary, topProducts } =
    stats ?? fallback;

  const hasData = expenseSummary.totalPurchases > 0;

  const statCards = [
    {
      title: "Total Gasto",
      value: currency(expenseSummary.totalSpent),
      description: `${expenseSummary.totalPurchases} compra(s)`,
      icon: Receipt,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Média Mensal",
      value: currency(expenseSummary.monthlyAverage),
      description: `em ${expenseSummary.monthlyEvolution.length} mês(es)`,
      icon: BarChart3,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Economia Acumulada",
      value: currency(economySummary.totalSaved),
      description: economySummary.bestMonth
        ? `Melhor mês: ${economySummary.bestMonth.month}`
        : "Sem economias registradas",
      icon: PiggyBank,
      color: "text-violet-600 bg-violet-100",
    },
    {
      title: "Ticket Médio",
      value: currency(frequencySummary.averageTicket),
      description: `a cada ${frequencySummary.daysBetweenPurchases ?? "-"} dias`,
      icon: ShoppingBag,
      color: "text-amber-600 bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bem-vindo, {user?.email?.split("@")[0] ?? "usuário"}!
        </h1>
        <p className="text-muted-foreground">
          {hasData
            ? "Resumo inteligente das suas compras."
            : "Comece escaneando um cupom fiscal para ver suas estatísticas."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasData && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Supermercados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topSupermarkets.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum supermercado registrado.
                  </p>
                )}
                {topSupermarkets.slice(0, 5).map((s) => (
                  <div key={s.supermarketId ?? s.supermarketName} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.supermarketName}</span>
                      <span className="text-muted-foreground">
                        {currency(s.totalSpent)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(s.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-muted-foreground">
                        {s.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.purchaseCount} compra(s)
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Categorias Mais Compradas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria registrada.
                  </p>
                )}
                {topCategories.slice(0, 6).map((c) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {c.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{currency(c.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 space-y-3 overflow-y-auto">
                {expenseSummary.monthlyEvolution.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum dado mensal disponível.
                  </p>
                )}
                {expenseSummary.monthlyEvolution
                  .slice(-12)
                  .map((m) => (
                    <div key={m.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {new Date(m.month + "-01").toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{currency(m.total)}</span>
                          <span className="text-xs text-muted-foreground">
                            {m.purchaseCount} compra(s)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              (m.total / Math.max(...expenseSummary.monthlyEvolution.map((x) => x.total), 1)) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  Produtos Mais Comprados
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 space-y-3 overflow-y-auto">
                {topProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum produto registrado.
                  </p>
                )}
                {topProducts.slice(0, 10).map((p) => (
                  <div key={p.productName} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">
                        {p.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.purchaseCount}x comprado(s), {p.totalQuantity} unidades
                      </p>
                    </div>
                    <p className="text-sm font-medium">{currency(p.totalSpent)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                Economia por Supermercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {economySummary.bySupermarket.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma economia registrada. Compare preços entre supermercados para economizar!
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {economySummary.bySupermarket.map((e) => (
                    <div
                      key={e.supermarketName}
                      className="rounded-lg border p-3"
                    >
                      <p className="text-sm font-medium">{e.supermarketName}</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {currency(e.saved)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
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
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-7 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
