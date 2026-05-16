"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageRotationAuthorityEngine,
  type RotationImageInput,
  type RotationStrategy,
} from "@/engines/content/ImageRotationAuthorityEngine";

export interface UseImageRotationOptions {
  images: RotationImageInput[];
  intervalMs?: number;
  enabled?: boolean;
  strategy?: RotationStrategy;
  antiRepeatWindow?: number;
  startIndex?: number;
}

export function useImageRotation({
  images,
  intervalMs = 6000,
  enabled = true,
  strategy = "weighted-random",
  antiRepeatWindow = 2,
  startIndex = 0,
}: UseImageRotationOptions) {
  const engineRef = useRef<ImageRotationAuthorityEngine | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [nextPreview, setNextPreview] = useState<string>("");

  const normalizedImages = useMemo(() => images.filter(Boolean), [images]);

  useEffect(() => {
    engineRef.current = new ImageRotationAuthorityEngine(normalizedImages, {
      strategy,
      antiRepeatWindow,
      startIndex,
    });

    setCurrentImage(engineRef.current.getCurrentImage());
    setCurrentIndex(engineRef.current.getCurrentIndex());
    setNextPreview(engineRef.current.getNextPreviewImage());
    void engineRef.current.preloadNext();

    return () => {
      engineRef.current = null;
    };
  }, [normalizedImages, strategy, antiRepeatWindow, startIndex]);

  useEffect(() => {
    if (!enabled || !engineRef.current || engineRef.current.getCount() < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!engineRef.current) return;
      const next = engineRef.current.nextAuto();
      setCurrentImage(next);
      setCurrentIndex(engineRef.current.getCurrentIndex());
      const preview = engineRef.current.getNextPreviewImage();
      setNextPreview(preview);
      void engineRef.current.preloadImage(preview);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs]);

  const rotateNext = () => {
    if (!engineRef.current) return;
    const next = engineRef.current.nextManual();
    setCurrentImage(next);
    setCurrentIndex(engineRef.current.getCurrentIndex());
    const preview = engineRef.current.getNextPreviewImage();
    setNextPreview(preview);
    void engineRef.current.preloadImage(preview);
  };

  const rotatePrev = () => {
    if (!engineRef.current) return;
    const prev = engineRef.current.prevManual();
    setCurrentImage(prev);
    setCurrentIndex(engineRef.current.getCurrentIndex());
    const preview = engineRef.current.getNextPreviewImage();
    setNextPreview(preview);
    void engineRef.current.preloadImage(preview);
  };

  return {
    currentImage,
    currentIndex,
    nextPreview,
    hasRotation: (engineRef.current?.getCount() ?? normalizedImages.length) > 1,
    rotateNext,
    rotatePrev,
  };
}
