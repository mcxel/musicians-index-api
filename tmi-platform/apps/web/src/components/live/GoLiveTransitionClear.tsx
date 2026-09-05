"use client";
import { useEffect } from "react";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useMediaTransitionDirector } from "@/lib/live/MediaTransitionDirector";

/** Clears legacy warp flag + canonical media transition on live room mount. */
export default function GoLiveTransitionClear() {
  const clear = useGoLiveTransition((s) => s.clear);
  const completeStarburst = useMediaTransitionDirector((s) => s.completeStarburst);
  useEffect(() => {
    clear();
    completeStarburst();
  }, [clear, completeStarburst]);
  return null;
}
