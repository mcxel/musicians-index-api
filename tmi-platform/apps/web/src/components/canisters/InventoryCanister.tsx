"use client";

/**
 * InventoryCanister — Fan gear vault bound to /api/avatar/inventory + /api/avatar/equip.
 * Honest empty state when unauthenticated or empty (Rule 20). Fake points removed.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import { InventoryPanel } from "@/components/InventoryPanel";
import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
import { getFanCosmetic } from "@/lib/avatars/FanCosmeticCatalog";
import type { AvatarSlot } from "@/lib/avatar/avatarPersistence";

interface InventoryCanisterProps {
  accentColor?: string;
  onEquip?: () => void;
}

type Row = {
  id: string;
  name: string;
  category: string;
  rarity: string;
  color: string;
  equipped: boolean;
  owned: boolean;
  equipSlot: AvatarSlot;
  icon: string;
};

function toRow(item: AvatarInventoryItem): Row {
  const def = getFanCosmetic(item.itemId);
  return {
    id: item.itemId,
    name: item.name,
    category: item.category ?? "collectibles",
    rarity: (item.rarity ?? "free").toUpperCase(),
    color: def?.accent ?? "#00FFFF",
    equipped: item.equipped,
    owned: item.owned !== false,
    equipSlot: (def?.equipSlot ?? "accessory") as AvatarSlot,
    icon: def?.icon ?? "📦",
  };
}

export function InventoryCanister({ accentColor = "#FF6B35", onEquip }: InventoryCanisterProps) {
  const [items, setItems] = useState<Row[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "auth" | "error">("loading");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/avatar/inventory", { credentials: "include", cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        setItems([]);
        setStatus("auth");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as { AvatarInventory?: { items?: AvatarInventoryItem[] } };
      const rows = (data.AvatarInventory?.items ?? [])
        .filter((i) => i.owned !== false)
        .map(toRow);
      setItems(rows);
      setStatus(rows.length ? "ready" : "empty");
    } catch {
      setStatus("error");
    }

    try {
      const bal = await fetch("/api/points/discount-quote", { credentials: "include", cache: "no-store" });
      if (bal.ok) {
        const q = (await bal.json()) as { pointsBalance?: number };
        if (typeof q.pointsBalance === "number") setPoints(q.pointsBalance);
      }
    } catch {
      /* points optional */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
        if (cancelled) return;
        if (!sessionRes.ok) {
          setStatus("auth");
          return;
        }
        const session = (await sessionRes.json()) as { authenticated?: boolean };
        if (!session.authenticated) {
          setStatus("auth");
          return;
        }
        await refresh();
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const toggleEquip = async (row: Row) => {
    if (busyId) return;
    setBusyId(row.id);
    try {
      const res = await fetch("/api/avatar/equip", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: row.id, slot: row.equipSlot }),
      });
      if (res.ok) {
        await refresh();
        onEquip?.();
        window.dispatchEvent(new CustomEvent("tmi:avatar-loadout-changed", { detail: { itemId: row.id } }));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RoleGate
      allow={["FAN", "ADMIN"]}
      fallback={
        <div style={{ padding: 16, color: "#aaa", fontSize: 12 }}>
          Avatar inventory is Fan-only (Rule 26).
        </div>
      }
    >
      <div
        style={{
          background: "rgba(5,3,16,0.92)",
          border: `1.5px solid ${accentColor}`,
          borderRadius: 14,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#fff",
          boxShadow: `0 0 25px ${accentColor}33`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 8,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
              CANISTER · GEAR & INVENTORY VAULT
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              3D Avatar Runtime v0 — evolving · real entitlements
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {points != null ? (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#FFD700",
                  background: "rgba(255,215,0,0.12)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,215,0,0.4)",
                }}
              >
                💎 {points.toLocaleString()} PTS
              </div>
            ) : null}
            <Link href="/avatar/shop" style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800 }}>
              COSMETICS →
            </Link>
          </div>
        </div>

        {status === "loading" && (
          <div style={{ padding: 24, color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Loading inventory…</div>
        )}
        {status === "auth" && (
          <div style={{ padding: 24, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
            Sign in as a Fan to load owned cosmetics.{" "}
            <Link href="/login" style={{ color: "#00FFFF" }}>
              Log in
            </Link>
          </div>
        )}
        {status === "error" && (
          <div style={{ padding: 24, color: "#FF2DAA", fontSize: 12 }}>
            Unable to load inventory.{" "}
            <button type="button" onClick={() => void refresh()} style={{ color: "#00FFFF", background: "none", border: "none", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}
        {status === "empty" && (
          <div style={{ padding: 24, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
            No owned cosmetics yet. Unlock free starters or spend points in the{" "}
            <Link href="/avatar/shop" style={{ color: "#FFD700" }}>
              Avatar Shop
            </Link>
            .
          </div>
        )}

        {status === "ready" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", gap: 12 }}>
            <div
              style={{
                background: "rgba(10,5,25,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.12em" }}>
                EQUIPPED LOADOUT
              </div>
              {items.filter((i) => i.equipped).length === 0 ? (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Nothing equipped</div>
              ) : (
                items
                  .filter((i) => i.equipped)
                  .map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        background: "rgba(0,255,255,0.1)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #00FFFF",
                        fontSize: 9,
                      }}
                    >
                      <span>
                        {item.icon} {item.name}
                      </span>
                      <strong style={{ color: "#00FFFF" }}>ON</strong>
                    </div>
                  ))
              )}
            </div>

            <div
              style={{
                background: "rgba(10,5,25,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: item.equipped ? `${item.color}15` : "rgba(255,255,255,0.03)",
                    border: item.equipped ? `1.5px solid ${item.color}` : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 8, fontWeight: 900, color: item.color }}>{item.rarity}</div>
                  <div style={{ fontSize: 18 }}>{item.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{item.name}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{item.category}</div>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void toggleEquip(item)}
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      padding: "3px 6px",
                      borderRadius: 4,
                      border: `1px solid ${item.color}`,
                      background: item.equipped ? item.color : "transparent",
                      color: item.equipped ? "#000" : item.color,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    {busyId === item.id ? "…" : item.equipped ? "EQUIPPED" : "EQUIP"}
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "rgba(10,5,25,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 10,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", marginBottom: 6 }}>
                STUDIO SOURCE
              </div>
              <InventoryPanel onEquip={onEquip} />
              <Link
                href="/store/flex?wing=apparel"
                style={{ display: "block", marginTop: 10, fontSize: 10, color: "#00E5FF", fontWeight: 800 }}
              >
                Flex apparel / costumes →
              </Link>
            </div>
          </div>
        )}
      </div>
    </RoleGate>
  );
}

export default InventoryCanister;
