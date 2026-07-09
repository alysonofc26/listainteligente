"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  Calendar,
  DollarSign,
  ShoppingCart,
  Trash2,
  RefreshCw,
  FileText,
  CreditCard,
} from "lucide-react";
import { getPurchaseDetail, deletePurchase, reopenPurchase } from "@/lib/actions/history";
import type { PurchaseDetail } from "history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

export default function HistoricoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const receiptId = params.id as string;

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPurchaseDetail(receiptId);
      setDetail(data);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da compra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [receiptId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta compra?")) return;
    setDeleting(true);

    try {
      await deletePurchase(receiptId);
      toast({ title: "Compra excluída", description: "Registro removido do histórico." });
      router.push("/historico");
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a compra.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  }

  async function handleReopen() {
    try {
      const result = await reopenPurchase(receiptId);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/historico")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <EmptyState
          icon={FileText}
          title="Compra não encontrada"
          description="O registro pode ter sido excluído ou o link é inválido."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/historico")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReopen}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reabrir compra
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {detail.supermarketName ?? "Supermercado não identificado"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data
              </div>
              <p className="mt-1 text-lg font-medium">
                {formatDate(detail.date)}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total
              </div>
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatCurrency(detail.totalAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                Itens
              </div>
              <p className="mt-1 text-lg font-medium">
                {detail.items.length} {detail.items.length === 1 ? "item" : "itens"}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Pagamento
              </div>
              <p className="mt-1 text-lg font-medium">
                {detail.paymentMethod ?? "Não informado"}
              </p>
            </div>
          </div>

          {detail.taxAmount !== null && (
            <div className="mt-2 text-sm text-muted-foreground">
              Impostos: {formatCurrency(detail.taxAmount)}
            </div>
          )}
        </CardContent>
      </Card>

      {detail.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Itens da compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {detail.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity > 1 && `${item.quantity}x `}
                      {formatCurrency(item.unitPrice)}
                      {item.category && ` • ${item.category}`}
                    </p>
                  </div>
                  <span className="ml-4 font-medium">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(detail.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {detail.rawText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Texto extraído do cupom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-y-auto rounded-md bg-muted/30 p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono">
              {detail.rawText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
