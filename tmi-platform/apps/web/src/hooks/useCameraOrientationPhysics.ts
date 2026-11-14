"use client";

import { useEffect, useState, useCallback } from "react";
import {
  type CameraFacingMode,
  type CameraTransformResult,
  calculateCameraPreviewPhysics,
  resolveDeviceScreenAngle,
} from "@/lib/camera/CameraOrientationPhysicsDirector";

export interface UseCameraOrientationPhysicsOptions {
  facingMode?: CameraFacingMode;
  isSelfPreview?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function useCameraOrientationPhysics(
  options: UseCameraOrientationPhysicsOptions = {},
): CameraTransformResult {
  const { facingMode = "user", isSelfPreview = true, videoRef } = options;

  const computeState = useCallback((): CameraTransformResult => {
    const { angle, type } = resolveDeviceScreenAngle();
    const videoWidth = videoRef?.current?.videoWidth ?? 0;
    const videoHeight = videoRef?.current?.videoHeight ?? 0;

    return calculateCameraPreviewPhysics({
      facingMode,
      screenAngle: angle,
      orientationType: type,
      isSelfPreview,
      videoWidth,
      videoHeight,
    });
  }, [facingMode, isSelfPreview, videoRef]);

  const [physics, setPhysics] = useState<CameraTransformResult>(computeState);

  useEffect(() => {
    const update = () => {
      setPhysics(computeState());
    };

    update();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", update, { passive: true });
      window.addEventListener("orientationchange", update, { passive: true });
      if (window.screen?.orientation) {
        window.screen.orientation.addEventListener("change", update);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", update);
        window.removeEventListener("orientationchange", update);
        if (window.screen?.orientation) {
          window.screen.orientation.removeEventListener("change", update);
        }
      }
    };
  }, [computeState]);

  return physics;
}

export default useCameraOrientationPhysics;
