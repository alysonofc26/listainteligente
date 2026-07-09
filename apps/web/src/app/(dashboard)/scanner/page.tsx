"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { useOCR } from "@/hooks/use-ocr";
import { CameraPreview } from "@/components/scanner/camera-preview";
import { ScanResult } from "@/components/scanner/scan-result";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { LabelResult } from "ocr";

interface ListOption {
  id: string;
  name: string;
}

export default function ScannerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [lists, setLists] = useState<ListOption[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const {
    videoRef,
    isStreaming,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
  } = useCamera();

  const {
    result,
    isProcessing,
    progress,
    error: ocrError,
    processFrame,
    reset,
  } = useOCR();

  const [listsLoaded, setListsLoaded] = useState(false);

  async function loadLists() {
    if (listsLoaded) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setLists(data);
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0]!.id);
      }
    }
    setListsLoaded(true);
  }

  const handleCapture = useCallback(async () => {
    const imageData = captureFrame();
    if (!imageData) return;
    await processFrame(imageData);
  }, [captureFrame, processFrame]);

  const handleAddToList = useCallback(
    async (data: LabelResult) => {
      if (!selectedListId || !data.productName) return;

      const { error } = await supabase.from("list_items").insert({
        list_id: selectedListId,
        product_name: data.productName,
        quantity: data.quantity ?? 1,
        unit: data.unit ?? "un",
        estimated_price: data.price,
      });

      if (error) throw error;
      router.refresh();
    },
    [selectedListId, supabase, router],
  );

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  const handleStartCamera = useCallback(async () => {
    await loadLists();
    await startCamera();
  }, [startCamera, loadLists]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scanner OCR</h1>
        <p className="text-muted-foreground">
          Escaneie etiquetas de produtos para adicionar automaticamente à sua lista.
        </p>
      </div>

      {lists.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            value={selectedListId ?? undefined}
            onValueChange={(value) => setSelectedListId(value)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecionar lista" />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Os produtos escaneados serão adicionados a esta lista.
          </span>
        </div>
      )}

      {lists.length === 0 && !listsLoaded ? (
        <div className="flex justify-center py-8">
          <EmptyState
            icon={ScanLine}
            title="Nenhuma lista disponível"
            description="Crie uma lista de compras antes de começar a escanear."
            action={
              <button onClick={() => router.push("/minha-lista")}>
                Criar lista
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <CameraPreview
              videoRef={videoRef}
              isStreaming={isStreaming}
              error={cameraError}
              onStart={handleStartCamera}
              onStop={stopCamera}
              onCapture={handleCapture}
              onSwitch={switchCamera}
              isProcessing={isProcessing}
            />

            {isProcessing && (
              <div className="text-center text-sm text-muted-foreground animate-pulse">
                {progress}
              </div>
            )}

            {ocrError && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {ocrError}
              </div>
            )}
          </div>

          <div>
            {result ? (
              <ScanResult
                result={result}
                listId={selectedListId ?? undefined}
                listName={
                  selectedListId
                    ? lists.find((l) => l.id === selectedListId)?.name
                    : undefined
                }
                onAddToList={handleAddToList}
                onRetry={handleRetry}
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center">
                <div className="space-y-2">
                  <ScanLine className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Aponte a câmera para uma etiqueta de preço e capture para
                    identificar o produto automaticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
