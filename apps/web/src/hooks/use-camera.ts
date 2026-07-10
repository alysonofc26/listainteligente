"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseCameraOptions {
  facingMode?: "environment" | "user";
  aspectRatio?: number;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => string | null;
  switchCamera: () => void;
}

export function useCamera(
  options: UseCameraOptions = {},
): UseCameraReturn {
  const { facingMode = "environment", aspectRatio = 4 / 3 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef(facingMode);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);

    try {
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingRef.current,
          aspectRatio,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Permissão de câmera negada. Permita o acesso nas configurações do navegador."
            : err.name === "NotFoundError"
              ? "Nenhuma câmera encontrada no dispositivo."
              : `Erro ao acessar câmera: ${err.message}`
          : "Erro ao acessar câmera.";

      setError(message);
      setIsStreaming(false);
    }
  }, [aspectRatio, stopCamera]);

  const switchCamera = useCallback(() => {
    facingRef.current = facingRef.current === "environment" ? "user" : "environment";
    startCamera();
  }, [startCamera]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
  };
}
