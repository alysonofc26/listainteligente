"use client";

import { useState, useRef, useCallback } from "react";
import { TesseractEngine, LabelParser, ImageProcessor } from "ocr";
import type { LabelResult, ParsedResult } from "ocr";

interface UseOCRReturn {
  result: ParsedResult<LabelResult> | null;
  isProcessing: boolean;
  progress: string;
  error: string | null;
  processFrame: (imageData: string) => Promise<void>;
  reset: () => void;
}

export function useOCR(): UseOCRReturn {
  const engineRef = useRef<TesseractEngine | null>(null);
  const processorRef = useRef<ImageProcessor | null>(null);
  const parserRef = useRef<LabelParser | null>(null);
  const [result, setResult] = useState<ParsedResult<LabelResult> | null>(null);
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

  const getParser = useCallback(() => {
    if (!parserRef.current) {
      parserRef.current = new LabelParser();
    }
    return parserRef.current;
  }, []);

  const processFrame = useCallback(
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
          setError("Não foi possível identificar texto na imagem. Tente novamente com melhor iluminação.");
          setIsProcessing(false);
          setProgress("");
          return;
        }

        setProgress("Interpretando resultado...");
        const parser = getParser();

        if (!parser.canParse(raw.text)) {
          setError("Nenhum produto identificado. Aponte para uma etiqueta de preço.");
          setIsProcessing(false);
          setProgress("");
          return;
        }

        const label = parser.parse(raw.text, raw.confidence);

        if (!label.productName && !label.price) {
          setError("Não foi possível extrair dados do produto. Tente novamente.");
          setIsProcessing(false);
          setProgress("");
          return;
        }

        setResult({
          type: "label",
          data: label,
          confidence: raw.confidence,
          rawText: raw.text,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao processar imagem.",
        );
      } finally {
        setIsProcessing(false);
        setProgress("");
      }
    },
    [getEngine, getProcessor, getParser],
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
    processFrame,
    reset,
  };
}
