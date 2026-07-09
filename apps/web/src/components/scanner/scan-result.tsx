"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, RotateCcw, ShoppingCart, AlertCircle } from "lucide-react";
import type { LabelResult, ParsedResult } from "ocr";
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

interface ScanResultProps {
  result: ParsedResult<LabelResult>;
  listId?: string;
  listName?: string;
  onAddToList?: (data: LabelResult) => Promise<void>;
  onRetry: () => void;
}

export function ScanResult({
  result,
  listId,
  listName,
  onAddToList,
  onRetry,
}: ScanResultProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const data = result.data;

  async function handleAddToList() {
    if (!onAddToList || !data.productName) return;
    setAdding(true);
    try {
      await onAddToList(data);
      setAdded(true);
      toast({
        title: "Produto adicionado",
        description: `"${data.productName}" foi adicionado à lista.`,
      });
    } catch {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o produto.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            Produto Identificado
          </CardTitle>
          <Badge variant="secondary">
            {Math.round(result.confidence * 100)}% confiança
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          {data.productName && (
            <div className="mb-1">
              <span className="text-xs text-muted-foreground">Produto</span>
              <p className="text-lg font-semibold">{data.productName}</p>
            </div>
          )}

          {data.price !== null && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Preço</span>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(data.price)}
              </p>
            </div>
          )}

          {(data.quantity ?? data.unit) && (
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              {data.quantity && (
                <span>
                  Qtd: <strong>{data.quantity}</strong>
                </span>
              )}
              {data.unit && (
                <span>
                  Un: <strong>{data.unit}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {!data.productName && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Nome não identificado</p>
              <p className="mt-1 text-xs opacity-80">
                O OCR não conseguiu extrair o nome do produto. Você pode adicionar manualmente.
              </p>
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          {listId && data.productName && (
            <Button
              onClick={handleAddToList}
              disabled={adding || added}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {added
                ? "Adicionado!"
                : adding
                  ? "Adicionando..."
                  : `Adicionar à ${listName ?? "lista"}`}
            </Button>
          )}

          <Button variant="outline" onClick={onRetry} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Escanear outro
          </Button>

          {!listId && (
            <Button variant="outline" onClick={() => router.push("/minha-lista")} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Ir para Minha Lista
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
