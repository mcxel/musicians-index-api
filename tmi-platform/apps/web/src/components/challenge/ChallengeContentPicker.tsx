"use client";

/**
 * Challenge Content Picker — glass pop-up for completed-work challenges.
 * Battles = skill vs skill · Cyphers = collaboration · Challenges = work vs work.
 * Sources Media Locker (songs, videos, clips…). Song Challenge subtype can filter to songs.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const PURPLE = "#AA2DFF";

export type ContentPickerItem = {
  id: string;
  title: string;
  type: string;
  url?: string | null;
};

type LoadState = "loading" | "ready" | "empty" | "error";

type Props = {
  side?: "A" | "B";
  maxSelect?: number;
  /** When set, only these locker types (e.g. ["songs"] for Song Challenge). */
  typeFilter?: string[] | null;
  disabled?: boolean;
  roomId?: string;
  castBy?: string | null;
  /** Glass popup mode — non-blocking of venue. Default true. */
  popup?: boolean;
  open?: boolean;
  onClose?: () => void;
  onLocked?: (items: ContentPickerItem[]) => void;
  onCast?: (items: ContentPickerItem[]) => void;
};

export default function ChallengeContentPicker({
  side = "A",
  maxSelect = 3,
  typeFilter = null,
  disabled = false,
  roomId,
  castBy,
  popup = true,
  open = true,
  onClose,
  onLocked,
  onCast,
}: Props) {
  const accent = side === "A" ? CYAN : FUCHSIA;
  const [items, setItems] = useState<ContentPickerItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [castMsg, setCastMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/media/locker", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setState("error");
        setErrorMsg("Unable to load Media Locker. Retry.");
        return;
      }
      const data = (await res.json()) as {
        items?: Array<{ id: string; title: string; type: string; url?: string }>;
      };
      let list = (data.items ?? []).map((i) => ({
        id: i.id,
        title: i.title || "Untitled",
        type: i.type || "work",
        url: i.url ?? null,
      }));
      if (typeFilter?.length) {
        list = list.filter((i) => typeFilter.includes(i.type));
      }
      setItems(list);
      setState(list.length === 0 ? "empty" : "ready");
    } catch {
      setState("error");
      setErrorMsg("Unable to load Media Locker. Retry.");
    }
  }, [typeFilter]);

  useEffect(() => {
    if (open) void load();
  }, [load, open]);

  function toggle(id: string) {
    if (disabled) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelect) return prev;
      return [...prev, id];
    });
  }

  function lockedItems(): ContentPickerItem[] {
    return selected
      .map((id) => items.find((s) => s.id === id))
      .filter((s): s is ContentPickerItem => !!s);
  }

  async function castToVenue(locked: ContentPickerItem[]) {
    if (!roomId) {
      onCast?.(locked);
      return true;
    }
    try {
      const r = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/challenge-cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "cast",
          side,
          castBy: castBy ?? "performer",
          items: locked,
        }),
      });
      const data = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !data.ok) {
        setCastMsg(data.error ?? "Cast failed");
        return false;
      }
      setCastMsg(`Cast to venue · ${locked.length} work${locked.length === 1 ? "" : "s"}`);
      onCast?.(locked);
      return true;
    } catch {
      setCastMsg("Unable to cast to venue");
      return false;
    }
  }

  async function lockIn() {
    if (disabled || selected.length === 0) return;
    setBusy(true);
    setCastMsg(null);
    const locked = lockedItems();
    onLocked?.(locked);
    await castToVenue(locked);
    setBusy(false);
  }

  if (!open) return null;

  const filterLabel =
    typeFilter?.length === 1 && typeFilter[0] === "songs"
      ? "SONGS"
      : typeFilter?.length
        ? typeFilter.join(" · ").toUpperCase()
        : "ALL WORK";

  const panel = (
    <motion.aside
      key="content-picker"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      style={{
        ...capsule,
        pointerEvents: "auto",
        borderColor: `${accent}55`,
      }}
      data-challenge-content-picker
      data-side={side}
    >
      <div aria-hidden style={sheen} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.18em",
              background: `linear-gradient(90deg, ${GOLD}, ${accent}, ${PURPLE})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CONTENT PICKER · SIDE {side}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 600 }}>
            Completed work vs work · {filterLabel} · {selected.length}/{maxSelect}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {popup && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(true)}
              style={iconBtn}
            >
              MINI
            </motion.button>
          )}
          {onClose && (
            <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={onClose} style={iconBtn}>
              ✕
            </motion.button>
          )}
        </div>
      </div>

      {state === "loading" && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Loading Media Locker…</div>
      )}
      {state === "error" && (
        <div>
          <div style={{ fontSize: 11, color: FUCHSIA, marginBottom: 8 }}>{errorMsg}</div>
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => void load()} style={ghostBtn(accent)}>
            RETRY
          </motion.button>
        </div>
      )}
      {state === "empty" && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
          No matching work in your Media Locker yet. Upload songs, videos, or clips to challenge.
        </div>
      )}
      {state === "ready" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto", scrollbarWidth: "thin" }}>
            {items.map((item) => {
              const on = selected.includes(item.id);
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  whileHover={disabled ? undefined : { scale: 1.02, x: 2 }}
                  whileTap={disabled ? undefined : { scale: 0.97 }}
                  onClick={() => toggle(item.id)}
                  style={{
                    textAlign: "left",
                    padding: "9px 11px",
                    borderRadius: 10,
                    border: `1px solid ${on ? accent : "rgba(255,255,255,0.12)"}`,
                    background: on
                      ? `linear-gradient(135deg, ${accent}28, rgba(5,5,16,0.5))`
                      : "rgba(255,255,255,0.04)",
                    color: "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: on ? `0 0 14px ${accent}33` : "none",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800 }}>
                    {on ? "✓ " : ""}
                    {item.title}
                  </div>
                  <div style={{ fontSize: 9, color: on ? accent : "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: 700, letterSpacing: "0.08em" }}>
                    {item.type.toUpperCase()}
                    {!item.url ? " · no media url" : ""}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <motion.button
            type="button"
            disabled={disabled || selected.length === 0 || busy}
            whileHover={selected.length && !disabled ? { scale: 1.03 } : undefined}
            whileTap={selected.length && !disabled ? { scale: 0.95 } : undefined}
            onClick={() => void lockIn()}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "11px 0",
              borderRadius: 12,
              border: `1px solid ${GOLD}`,
              background:
                selected.length === 0
                  ? "rgba(255,255,255,0.08)"
                  : `linear-gradient(100deg, ${GOLD}, #FF9500, ${accent})`,
              color: selected.length === 0 ? "rgba(255,255,255,0.35)" : "#050510",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.12em",
              cursor: selected.length === 0 || disabled || busy ? "not-allowed" : "pointer",
              boxShadow: selected.length ? `0 6px 20px ${GOLD}44` : "none",
            }}
          >
            {busy ? "CASTING…" : "LOCK & CAST TO VENUE"}
          </motion.button>
        </>
      )}
      {castMsg && (
        <p style={{ margin: "8px 0 0", fontSize: 10, fontWeight: 700, color: castMsg.includes("Cast") ? CYAN : FUCHSIA }}>
          {castMsg}
        </p>
      )}
    </motion.aside>
  );

  if (!popup) return panel;

  return (
    <div
      style={{
        position: "fixed",
        left: side === "A" ? 12 : undefined,
        right: side === "B" ? 12 : side === "A" ? undefined : 12,
        bottom: "10%",
        zIndex: 47,
        pointerEvents: "none",
        maxWidth: "min(340px, calc(100vw - 24px))",
      }}
    >
      <AnimatePresence mode="wait">
        {collapsed ? (
          <motion.button
            key="tab"
            type="button"
            initial={{ opacity: 0, x: side === "A" ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setCollapsed(false)}
            style={{
              ...edgeTab,
              pointerEvents: "auto",
              borderColor: `${accent}77`,
              color: accent,
            }}
          >
            CONTENT · {side}
          </motion.button>
        ) : (
          panel
        )}
      </AnimatePresence>
    </div>
  );
}

const capsule: CSSProperties = {
  position: "relative",
  width: "min(340px, calc(100vw - 24px))",
  padding: 14,
  borderRadius: 18,
  border: "1px solid",
  background:
    "linear-gradient(155deg, rgba(12,8,28,0.58) 0%, rgba(5,5,16,0.45) 50%, rgba(40,10,48,0.52) 100%)",
  boxShadow:
    "0 16px 48px rgba(0,0,0,0.55), 0 0 32px rgba(0,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.16)",
  backdropFilter: "blur(22px) saturate(1.45)",
  WebkitBackdropFilter: "blur(22px) saturate(1.45)",
  overflow: "hidden",
};

const sheen: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,45,170,0.05) 100%)",
};

const iconBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.7)",
  fontSize: 8,
  fontWeight: 800,
  letterSpacing: "0.1em",
  borderRadius: 8,
  padding: "5px 9px",
  cursor: "pointer",
};

const edgeTab: CSSProperties = {
  border: "1px solid",
  background: "linear-gradient(180deg, rgba(0,255,255,0.15), rgba(5,5,16,0.6))",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.14em",
  padding: "12px 10px",
  borderRadius: 12,
  cursor: "pointer",
  backdropFilter: "blur(16px)",
};

function ghostBtn(accent: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${accent}`,
    background: `${accent}22`,
    color: accent,
    cursor: "pointer",
  };
}
