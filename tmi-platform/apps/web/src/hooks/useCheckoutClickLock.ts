"use client";

/**
 * Click-lock helper for Stripe / commerce checkout CTAs.
 * States: idle → creating_checkout → redirecting
 */

import { useCallback, useRef, useState } from "react";

export type CheckoutClickState = "idle" | "creating_checkout" | "redirecting";

export function useCheckoutClickLock() {
  const [state, setState] = useState<CheckoutClickState>("idle");
  const locked = useRef(false);

  const runCheckout = useCallback(async (create: () => Promise<string | null | undefined>) => {
    if (locked.current || state !== "idle") return;
    locked.current = true;
    setState("creating_checkout");
    try {
      const url = await create();
      if (!url) {
        locked.current = false;
        setState("idle");
        return;
      }
      setState("redirecting");
      window.location.assign(url);
    } catch {
      locked.current = false;
      setState("idle");
    }
  }, [state]);

  const reset = useCallback(() => {
    locked.current = false;
    setState("idle");
  }, []);

  return {
    state,
    busy: state !== "idle",
    label:
      state === "creating_checkout"
        ? "Creating checkout…"
        : state === "redirecting"
          ? "Redirecting…"
          : null,
    runCheckout,
    reset,
  };
}
