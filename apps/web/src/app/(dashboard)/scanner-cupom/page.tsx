"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { useReceiptScanner } from "@/hooks/use-receipt-scanner";
import { CameraPreview } from "@/components/scanner/camera-preview";
import { ReceiptResult } from "@/components/scanner/receipt-result";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveReceipt, importReceiptItems, getReceiptLists } from "@/lib/actions/receipts";

interface ListOption {
  id: string;
  name: string;
}

export default function ScannerCupomPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListOption[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listsLoaded, setListsLoaded] = useState(false);
  const [savedReceiptId, setSavedReceiptId] = useState<string | null>(null);

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
    processReceipt,
    reset,
  } = useReceiptScanner();

  async function loadLists() {
    if (listsLoaded) return;
    const data = await getReceiptLists();
    setLists(data);
    if (data.length > 0 && !selectedListId) {
      setSelectedListId(data[0]!.id);
    }
    setListsLoaded(true);
  }

  const handleCapture = useCallback(async () => {
    const imageData = captureFrame();
    if (!imageData) return;
    setSavedReceiptId(null);
    await processReceipt(imageData);
  }, [captureFrame, processReceipt]);

  const handleSave = useCallback(async (): Promise<string> => {
    if (!result) throw new Error("Nenhum resultado disponível");

    const receiptId = await saveReceipt(result, null);
    setSavedReceiptId(receiptId);
    return receiptId;
  }, [result]);

  const handleImport = useCallback(
    async (listId: string) => {
      if (!savedReceiptId) throw new Error("Salve o cupom no histórico primeiro.");

      await importReceiptItems(savedReceiptId, listId);
      router.refresh();
    },
    [savedReceiptId, router],
  );

  const handleRetry = useCallback(() => {
    setSavedReceiptId(null);
    reset();
  }, [reset]);

  const handleStartCamera = useCallback(async () => {
    await loadLists();
    await startCamera();
  }, [startCamera, loadLists]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Scanner de Cupom Fiscal
        </h1>
        <p className="text-muted-foreground">
          Escaneie cupons fiscais para registrar suas compras no histórico.
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
            Após salvar, os itens poderão ser importados para esta lista.
          </span>
        </div>
      )}

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
            <ReceiptResult
              result={result}
              listId={selectedListId ?? undefined}
              listName={
                selectedListId
                  ? lists.find((l) => l.id === selectedListId)?.name
                  : undefined
              }
              saved={savedReceiptId !== null}
              onSaveToHistory={handleSave}
              onImportToList={handleImport}
              onRetry={handleRetry}
            />
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center">
              <div className="space-y-2">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Aponte a câmera para um cupom fiscal e capture para extrair
                  todos os produtos e valores automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
