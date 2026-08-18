"use client";
import { useEffect } from "react";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";

/** Drop this anywhere in the live room page tree.
 *  On first mount it clears the go-live starfield transition. */
export default function GoLiveTransitionClear() {
  const clear = useGoLiveTransition((s) => s.clear);
  useEffect(() => { clear(); }, [clear]);
  return null;
}
