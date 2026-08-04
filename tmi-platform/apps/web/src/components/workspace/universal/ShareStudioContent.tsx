/**
 * Share Studio Phase 1 — share Playlist Artifact (music package), not the chassis.
 * Recipient plays the artifact in their own equipped Media Player.
 * Uses ShareLinkEngine; no fake social post success (Rule 20).
 */

"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  buildEmailShare,
  buildFacebookShare,
  buildShareUrl,
  buildSmsShare,
  buildTwitterShare,
  buildInstagramCopyPrompt,
  type ShareTarget,
} from "@/lib/share/ShareLinkEngine";
import { makePlaylistArtifactShareUrl } from "@/lib/artifacts/PlaylistArtifactEngine";
import type { WorkspaceContext } from "@/lib/workspace/universal/types";

export interface ShareStudioContentProps {
  context: WorkspaceContext;
}

type ShareFeedback = { kind: "ok" | "err"; message: string } | null;

export default function ShareStudioContent({ context }: ShareStudioContentProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>(null);
  const [busy, setBusy] = useState(false);

  const artifactId = context.artifactId || context.playlistId;

  const target: ShareTarget = useMemo(() => {
    const title =
      context.playlistTitle ||
      context.trackTitle ||
      "Playlist Artifact — The Musician's Index";
    const text = context.artistName
      ? `Playlist Artifact: ${context.playlistTitle ?? context.trackTitle ?? "Listen"} — ${context.artistName}. Plays in your Media Player.`
      : `Playlist Artifact: ${context.playlistTitle || context.trackTitle || title}. Recipient plays in their equipped Media Player.`;
    const path =
      context.sharePath ||
      (artifactId
        ? `/artifact/${artifactId}`
        : context.trackId
          ? `/share/${context.trackId}`
          : typeof window !== "undefined"
            ? window.location.pathname
            : "/");
    return { title, text, path };
  }, [context, artifactId]);

  const shareUrl = useMemo(() => {
    if (context.linkUrl) return context.linkUrl;
    if (artifactId) return makePlaylistArtifactShareUrl(artifactId);
    return buildShareUrl(target);
  }, [context.linkUrl, artifactId, target]);

  async function copyLink() {
    setBusy(true);
    setFeedback(null);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback({ kind: "ok", message: "Link copied to clipboard." });
      } else {
        setFeedback({ kind: "err", message: "Clipboard unavailable in this browser." });
      }
    } catch {
      setFeedback({ kind: "err", message: "Could not copy link." });
    } finally {
      setBusy(false);
    }
  }

  async function nativeShare() {
    setBusy(true);
    setFeedback(null);
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: target.title,
          text: target.text,
          url: shareUrl,
        });
        setFeedback({ kind: "ok", message: "Share sheet opened." });
      } else {
        setFeedback({
          kind: "err",
          message: "Native share not available — use Copy Link or a target below.",
        });
      }
    } catch (err) {
      // User cancel is not an error we should fake as success.
      const name = err instanceof Error ? err.name : "";
      if (name === "AbortError") {
        setFeedback(null);
      } else {
        setFeedback({ kind: "err", message: "Share cancelled or failed." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyPrompt(builder: (t: ShareTarget) => string, label: string) {
    setBusy(true);
    setFeedback(null);
    try {
      const text = builder(target);
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setFeedback({ kind: "ok", message: `${label} text copied — paste into the app.` });
      } else {
        setFeedback({ kind: "err", message: "Clipboard unavailable." });
      }
    } catch {
      setFeedback({ kind: "err", message: `Could not copy ${label} text.` });
    } finally {
      setBusy(false);
    }
  }

  const subjectLabel = artifactId
    ? `Playlist Artifact: ${context.playlistTitle ?? artifactId}`
    : context.playlistTitle
      ? `Playlist Artifact: ${context.playlistTitle}`
      : context.trackTitle
        ? `Track: ${context.trackTitle}`
        : "Current page link";

  const targets: Array<{
    id: string;
    label: string;
    hint: string;
    onClick: () => void;
  }> = [
    {
      id: "native",
      label: "Device Share",
      hint: "System share sheet when available",
      onClick: () => void nativeShare(),
    },
    {
      id: "copy",
      label: "Copy Link",
      hint: shareUrl,
      onClick: () => void copyLink(),
    },
    {
      id: "twitter",
      label: "X / Twitter",
      hint: "Opens intent URL",
      onClick: () => {
        window.open(buildTwitterShare(target), "_blank", "noopener,noreferrer");
        setFeedback({ kind: "ok", message: "Opened X share intent." });
      },
    },
    {
      id: "facebook",
      label: "Facebook",
      hint: "Opens sharer URL",
      onClick: () => {
        window.open(buildFacebookShare(target), "_blank", "noopener,noreferrer");
        setFeedback({ kind: "ok", message: "Opened Facebook sharer." });
      },
    },
    {
      id: "sms",
      label: "SMS",
      hint: "Opens messages composer",
      onClick: () => {
        window.location.href = buildSmsShare(target);
        setFeedback({ kind: "ok", message: "Opened SMS composer." });
      },
    },
    {
      id: "email",
      label: "Email",
      hint: "Opens mail client",
      onClick: () => {
        window.location.href = buildEmailShare(target);
        setFeedback({ kind: "ok", message: "Opened email composer." });
      },
    },
    {
      id: "instagram",
      label: "Instagram",
      hint: "Copy caption + link (no API post)",
      onClick: () => void copyPrompt(buildInstagramCopyPrompt, "Instagram"),
    },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 14,
        gap: 12,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(0,255,255,0.28)",
          background: "rgba(0,255,255,0.06)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
          SHARING PLAYLIST ARTIFACT
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{subjectLabel}</div>
        <div style={{ fontSize: 11, color: "rgba(0,255,255,0.7)", marginTop: 4 }}>
          Chassis stays with you — recipient plays this package in their equipped Media Player.
        </div>
        {context.artistName ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            {context.artistName}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "rgba(255,255,255,0.55)",
            wordBreak: "break-all",
          }}
        >
          {shareUrl}
        </div>
      </div>

      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
        TARGETS
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={busy}
            onClick={t.onClick}
            style={targetBtn}
          >
            <span style={{ fontWeight: 800, fontSize: 12 }}>{t.label}</span>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "62%",
              }}
            >
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      {feedback ? (
        <div
          role="status"
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 11,
            border:
              feedback.kind === "ok"
                ? "1px solid rgba(0,255,136,0.4)"
                : "1px solid rgba(255,80,80,0.45)",
            background:
              feedback.kind === "ok" ? "rgba(0,255,136,0.1)" : "rgba(255,80,80,0.1)",
            color: feedback.kind === "ok" ? "#9dffc8" : "#ffb0b0",
          }}
        >
          {feedback.message}
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
          Honest status only — no fake &quot;posted&quot; confirmation.
        </div>
      )}
    </div>
  );
}

const targetBtn: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
};
