/**
 * useContentTranslationView — §9950–§9952 / §9838–§9839
 *
 * Client hook exposing the shared TmiTranslationAuthority as a per-content
 * VIEW. Translation never mutates the canonical original and never creates a
 * second post/message — it is a viewer presentation layer over ONE content id.
 *
 * Talks to /api/translation/view (server wraps TmiTranslationAuthority so the
 * provider key never ships to the browser). Non-BODY identity fields are
 * refused client-side too, so a NAME/USERNAME never round-trips.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type TranslationFieldKind = "BODY" | "NAME" | "USERNAME" | "SONG_TITLE" | "ARTIST_NAME";

export type TranslationViewStatus =
  | "IDLE"
  | "LOADING"
  | "READY"
  | "SAME_LANGUAGE"
  | "SKIPPED_IDENTITY"
  | "FAILED";

export type ContentTranslationViewState = {
  status: TranslationViewStatus;
  /** Translated text when status READY/SAME_LANGUAGE; otherwise null. */
  text: string | null;
  showingTranslation: boolean;
  textDirection: "ltr" | "rtl";
  provider?: string;
};

const INITIAL: ContentTranslationViewState = {
  status: "IDLE",
  text: null,
  showingTranslation: false,
  textDirection: "ltr",
};

function detectBrowserLanguage(): string {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.split("-")[0].toLowerCase();
  }
  return "en";
}

export function useContentTranslationView(input: {
  contentId: string;
  contentVersion?: number;
  originalText: string;
  surface: string;
  fieldKind?: TranslationFieldKind;
  /** Override target; defaults to the viewer's browser language. */
  targetLanguage?: string;
}) {
  const { contentId, originalText, surface } = input;
  const contentVersion = input.contentVersion ?? 1;
  const fieldKind = input.fieldKind ?? "BODY";
  const target = (input.targetLanguage ?? detectBrowserLanguage()).toLowerCase();

  const [state, setState] = useState<ContentTranslationViewState>(INITIAL);
  const requestSeq = useRef(0);

  // Reset whenever the underlying content changes identity/version.
  useEffect(() => {
    setState(INITIAL);
  }, [contentId, contentVersion, originalText, target]);

  const translate = useCallback(async () => {
    // Identity guard — names/usernames/titles never machine-translated.
    if (fieldKind !== "BODY") {
      setState({ ...INITIAL, status: "SKIPPED_IDENTITY" });
      return;
    }
    const my = ++requestSeq.current;
    setState((s) => ({ ...s, status: "LOADING", showingTranslation: true }));
    try {
      const res = await fetch("/api/translation/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          contentVersion,
          originalText,
          targetLanguage: target,
          surface,
          fieldKind: "BODY",
        }),
      });
      if (!res.ok) throw new Error(`translation ${res.status}`);
      const data = (await res.json()) as {
        status: string;
        translatedText: string | null;
        textDirection?: "ltr" | "rtl";
        provider?: string;
      };
      if (my !== requestSeq.current) return; // stale
      if (data.status === "READY" || data.status === "SAME_LANGUAGE") {
        setState({
          status: data.status,
          text: data.translatedText,
          showingTranslation: true,
          textDirection: data.textDirection ?? "ltr",
          provider: data.provider,
        });
      } else if (data.status === "SKIPPED_IDENTITY") {
        setState({ ...INITIAL, status: "SKIPPED_IDENTITY" });
      } else {
        // FAILED / PENDING → keep original visible, honest failure.
        setState({ ...INITIAL, status: "FAILED" });
      }
    } catch {
      if (my !== requestSeq.current) return;
      setState({ ...INITIAL, status: "FAILED" });
    }
  }, [contentId, contentVersion, originalText, target, surface, fieldKind]);

  const showOriginal = useCallback(() => {
    setState((s) => ({ ...s, showingTranslation: false }));
  }, []);

  const showTranslation = useCallback(() => {
    setState((s) =>
      s.status === "READY" || s.status === "SAME_LANGUAGE" ? { ...s, showingTranslation: true } : s,
    );
  }, []);

  return {
    ...state,
    /** Text to render right now (translation view or canonical original). */
    displayText:
      state.showingTranslation && (state.status === "READY" || state.status === "SAME_LANGUAGE")
        ? state.text ?? originalText
        : originalText,
    translate,
    showOriginal,
    showTranslation,
    canTranslate: fieldKind === "BODY",
  };
}
