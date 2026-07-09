import type { OCRRawResult, OCRBlock } from "../types";

interface TesseractLine {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface TesseractData {
  text: string;
  confidence: number;
  lines: TesseractLine[];
}

interface TesseractWorker {
  setLanguage: (lang: string) => Promise<void>;
  recognize: (image: string | Buffer) => Promise<{ data: TesseractData }>;
  terminate: () => Promise<void>;
  setParameters: (params: Record<string, string | number>) => Promise<void>;
}

let tesseractModule: typeof import("tesseract.js") | null = null;

async function loadTesseract() {
  if (!tesseractModule) {
    tesseractModule = await import("tesseract.js");
  }
  return tesseractModule;
}

export class TesseractEngine {
  private worker: TesseractWorker | null = null;
  private isInitialized = false;

  async initialize(language = "por"): Promise<void> {
    if (this.isInitialized) return;

    const module = await loadTesseract();
    this.worker = (await module.createWorker(language)) as unknown as TesseractWorker;

    await this.worker.setParameters({
      tessedit_pageseg_mode: "6",
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç0123456789R$.%,/- ",
    });

    this.isInitialized = true;
  }

  async recognize(imageData: string | Buffer): Promise<OCRRawResult> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }

    const { data } = await this.worker!.recognize(imageData);

    const blocks: OCRBlock[] = (data.lines ?? []).map((line) => ({
      text: line.text,
      confidence: line.confidence / 100,
      bbox: {
        x0: line.bbox.x0,
        y0: line.bbox.y0,
        x1: line.bbox.x1,
        y1: line.bbox.y1,
      },
    }));

    return {
      text: data.text,
      confidence: data.confidence / 100,
      blocks,
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  get status(): "idle" | "initializing" | "ready" | "terminated" {
    if (!this.isInitialized) return "idle";
    return "ready";
  }
}

export type { TesseractWorker };
