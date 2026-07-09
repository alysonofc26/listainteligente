"use client";

import { useState, useRef, useCallback } from "react";
import {
  TesseractEngine,
  ImageProcessor,
  PurchaseBuilder,
} from "ocr";
import type { PurchaseResult, ValidationResult } from "ocr";

interface UseReceiptScannerReturn {
  result: PurchaseResult | null;
  isProcessing: boolean;
  progress: string;
  error: string | null;
  processReceipt: (imageData: string) => Promise<void>;
  reset: () => void;
}

export function useReceiptScanner(): UseReceiptScannerReturn {
  const engineRef = useRef<TesseractEngine | null>(null);
  const processorRef = useRef<ImageProcessor | null>(null);
  const builderRef = useRef<PurchaseBuilder | null>(null);

  const [result, setResult] = useState<PurchaseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getEngine = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = new TesseractEngine();
    }
    if (engineRef.current.status !== "ready") {
      setProgress("Inicializando OCR...");
      await engineRef.current.initialize();
    }
    return engineRef.current;
  }, []);

  const getProcessor = useCallback(() => {
    if (!processorRef.current) {
      processorRef.current = new ImageProcessor();
    }
    return processorRef.current;
  }, []);

  const getBuilder = useCallback(() => {
    if (!builderRef.current) {
      builderRef.current = new PurchaseBuilder();
    }
    return builderRef.current;
  }, []);

  const processReceipt = useCallback(
    async (imageData: string) => {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      try {
        setProgress("Processando imagem...");
        const processor = getProcessor();
        const processed = await processor.preprocess(imageData);

        setProgress("Reconhecendo texto...");
        const engine = await getEngine();
        const raw = await engine.recognize(processed);

        if (raw.confidence < 0.1) {
          setError(
            "Não foi possível identificar texto no cupom. Tente novamente com melhor iluminação.",
          );
          setIsProcessing(false);
          setProgress("");
          return;
        }

        setProgress("Interpretando cupom fiscal...");
        const builder = getBuilder();
        const purchase = builder.build(raw.text, raw.confidence);

        const errors = purchase.validations.filter(
          (v: ValidationResult) => v.status === "error",
        );

        if (errors.length > 0) {
          setError(errors.map((e: ValidationResult) => e.message).join(" "));
          setIsProcessing(false);
          setProgress("");
          return;
        }

        if (purchase.items.length === 0) {
          setError(
            "Nenhum produto foi identificado no cupom. Verifique se a imagem está nítida.",
          );
          setIsProcessing(false);
          setProgress("");
          return;
        }

        setResult(purchase);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao processar cupom.",
        );
      } finally {
        setIsProcessing(false);
        setProgress("");
      }
    },
    [getEngine, getProcessor, getBuilder],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsProcessing(false);
    setProgress("");
  }, []);

  return {
    result,
    isProcessing,
    progress,
    error,
    processReceipt,
    reset,
  };
}
