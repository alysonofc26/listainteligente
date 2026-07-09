"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  RotateCcw,
  ShoppingCart,
  AlertCircle,
  Store,
  Calendar,
  TrendingDown,
  List,
  Download,
} from "lucide-react";
import type { PurchaseResult } from "ocr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/shared/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface ReceiptResultProps {
  result: PurchaseResult;
  listId?: string;
  listName?: string;
  saved: boolean;
  onSaveToHistory: () => Promise<string>;
  onImportToList: (listId: string) => Promise<void>;
  onRetry: () => void;
}

export function ReceiptResult({
  result,
  listId,
  listName,
  saved,
  onSaveToHistory,
  onImportToList,
  onRetry,
}: ReceiptResultProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const { metadata, items, validations } = result;
  const hasWarnings = validations.some((v) => v.status === "warning");

  async function handleSave() {
    setSaving(true);
    try {
      await onSaveToHistory();
      toast({
        title: "Cupom salvo",
        description: "Compra registrada no histórico.",
      });
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cupom.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleImport() {
    if (!listId) return;
    setImporting(true);
    try {
      await onImportToList(listId);
      setImported(true);
      toast({
        title: "Itens importados",
        description: `${items.length} itens adicionados à lista "${listName ?? ""}".`,
      });
    } catch {
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar os itens.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            Cupom Identificado
          </CardTitle>
          <Badge variant="secondary">
            {Math.round(metadata.confidence * 100)}% confiança
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span>{metadata.supermarketName ?? "Estabelecimento não identificado"}</span>
          </div>

          {metadata.date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{metadata.date}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <span>
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="pt-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(metadata.totalAmount)}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
            <List className="h-4 w-4" />
            Itens identificados
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center rounded-md bg-muted/30 px-3 py-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.normalizedName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity > 1 && `${item.quantity}x `}
                    {formatCurrency(item.unitPrice)}/{item.unit}
                    {item.category && ` • ${item.category}`}
                  </p>
                </div>
                <span className="ml-2 font-medium">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {hasWarnings && (
          <div className="space-y-1">
            {validations
              .filter((v) => v.status !== "ok")
              .map((validation, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                    validation.status === "error"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                  }`}
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{validation.message}</p>
                </div>
              ))}
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            variant={saved ? "outline" : "default"}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {saved
              ? "Salvo no Histórico!"
              : saving
                ? "Salvando..."
                : "Salvar no Histórico"}
          </Button>

          {listId && saved && (
            <Button
              onClick={handleImport}
              disabled={importing || imported}
              variant={imported ? "outline" : "secondary"}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {imported
                ? "Itens Importados!"
                : importing
                  ? "Importando..."
                  : `Importar para ${listName ?? "lista"}`}
            </Button>
          )}

          <Button variant="outline" onClick={onRetry} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Escanear outro
          </Button>

          {!listId && saved && (
            <Button
              variant="outline"
              onClick={() => router.push("/minha-lista")}
              className="flex-1"
            >
              <List className="mr-2 h-4 w-4" />
              Ir para Minha Lista
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
