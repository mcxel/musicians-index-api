"use client";
/**
 * YoArtifactDetachButton — "DETACH" CTA for owned YoArtifact releases.
 *
 * Honest current state (Rule 20): the binary .yo packager and cross-platform
 * player runtime do not yet exist. This button opens a streaming playback
 * view in a new tab as the honest interim experience, not a file download.
 *
 * Visual state machine:
 *   NOT_OWNED  → hidden (renders null)
 *   LOADING    → spinner label
 *   OWNED      → "DETACH" button (opens /yo/play/[cardId] in new tab)
 *   ERROR      → "Retry" prompt
 *
 * When the .yo runtime ships, replace the window.open() call with the
 * actual package-generation endpoint — the button shell stays identical.
 */

import { useEffect } from "react";
import { useYoCollection } from "@/lib/artifacts/YoCollectionStore";

interface YoArtifactDetachButtonProps {
  cardId: string;
  /** Optional label override — defaults to "DETACH" */
  label?: string;
}

export default function YoArtifactDetachButton({
  cardId,
  label = "DETACH",
}: YoArtifactDetachButtonProps) {
  const { status, loadCollection, isOwned } = useYoCollection();

  useEffect(() => {
    if (status === "idle") {
      void loadCollection();
    }
  }, [status, loadCollection]);

  // Not yet loaded — show nothing to avoid flash of wrong state
  if (status === "idle" || status === "loading") {
    return (
      <span style={styles.loading}>Loading…</span>
    );
  }

  // Collection loaded but this card not owned — render nothing
  if (!isOwned(cardId)) return null;

  // Error fallback — show retry
  if (status === "error") {
    return (
      <button style={styles.retry} onClick={() => void loadCollection()}>
        Retry
      </button>
    );
  }

  const handleDetach = () => {
    // Current honest behaviour: open the streaming player in a new tab.
    // Replace with package-gen endpoint when .yo runtime ships.
    window.open(`/yo/play/${encodeURIComponent(cardId)}`, "_blank", "noopener");
  };

  return (
    <button style={styles.btn} onClick={handleDetach}>
      {label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    padding: "7px 18px",
    background: "linear-gradient(135deg, #00FFFF22, #AA2DFF22)",
    border: "1px solid #00FFFF55",
    borderRadius: 6,
    color: "#00FFFF",
    fontWeight: 700,
    fontSize: "0.78rem",
    letterSpacing: "0.08em",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  loading: {
    fontSize: "0.75rem",
    color: "#555",
  },
  retry: {
    fontSize: "0.75rem",
    color: "#FF2DAA",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
