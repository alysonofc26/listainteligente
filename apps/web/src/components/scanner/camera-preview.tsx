"use client";

import { Camera, CameraOff, RefreshCw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onCapture: () => void;
  onSwitch: () => void;
  isProcessing: boolean;
}

export function CameraPreview({
  videoRef,
  isStreaming,
  error,
  onStart,
  onStop,
  onCapture,
  onSwitch,
  isProcessing,
}: CameraPreviewProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
        <CameraOff className="h-12 w-12 text-muted-foreground/60" />
        <div className="space-y-1">
          <p className="font-medium">Câmera indisponível</p>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={onStart}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-[4/3] max-w-lg overflow-hidden rounded-xl bg-black">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
            <Camera className="h-12 w-12" />
            <p className="text-sm">Clique em Iniciar para abrir a câmera</p>
          </div>
        )}

        {isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ScanLine
              className={cn(
                "h-48 w-48 text-white/20",
                isProcessing && "animate-pulse",
              )}
            />
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2 text-sm">Processando...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {!isStreaming ? (
          <Button onClick={onStart} size="lg">
            <Camera className="mr-2 h-4 w-4" />
            Iniciar Câmera
          </Button>
        ) : (
          <>
            <Button
              onClick={onSwitch}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              title="Virar câmera"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              onClick={onCapture}
              size="lg"
              disabled={isProcessing}
              className="h-12 w-24 rounded-full"
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 border-white",
                  isProcessing && "animate-pulse",
                )}
              />
            </Button>
            <Button
              onClick={onStop}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              title="Desligar câmera"
            >
              <CameraOff className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
