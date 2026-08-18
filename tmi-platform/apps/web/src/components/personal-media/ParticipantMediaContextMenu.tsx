"use client";

/**
 * Thin chevron / context-ring menu for one participant identity.
 * Mount later on real lounge context rings. Honest empty if identity is unknown.
 * PROFILE and PRIVATE TALK only render when a real href / handler exists.
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  defaultPersonalMediaCommandBus,
  defaultPersonalMediaRouter,
  getParticipantMediaMenu,
  labelMonitorTarget,
  type PersonalMediaCommand,
  type PersonalMediaCommandBus,
  type PersonalMediaRouter,
  type ParticipantMediaMenuItem,
} from "@/lib/personal-media";
import { requestOneToOneSocial } from "@/lib/trustSafety/requestOneToOneSocial";

const CYAN = "#00FFFF";
const GOLD = "#FFD700";

export type ParticipantMediaContextMenuProps = {
  participantId: string;
  router?: PersonalMediaRouter;
  commandBus?: PersonalMediaCommandBus;
  profileHref?: string;
  onPrivateTalk?: (participantId: string) => void;
  onProfile?: (href: string) => void;
};

export default function ParticipantMediaContextMenu({
  participantId,
  router = defaultPersonalMediaRouter,
  commandBus = defaultPersonalMediaCommandBus,
  profileHref,
  onPrivateTalk,
  onProfile,
}: ParticipantMediaContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<"WATCH_ON" | "MOVE_TO" | "REMOVE_FROM_MONITOR" | null>(null);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  const items = useMemo(
    () =>
      getParticipantMediaMenu(router, participantId, {
        profileHref,
        privateTalkAvailable: Boolean(onPrivateTalk),
      }),
    [router, participantId, profileHref, onPrivateTalk],
  );

  if (items.length === 0) {
    return (
      <div style={emptyMount} data-personal-media-context-empty="true">
        No participant identity in MY VIEW router.
      </div>
    );
  }

  async function assertPersonalOneToOne(): Promise<boolean> {
    const identity = router.getParticipant(participantId);
    const targetUserId = identity?.canonicalIdentityId || participantId;
    const decision = await requestOneToOneSocial(targetUserId);
    if (!decision.allowed) {
      setBlockReason(decision.reason);
      return false;
    }
    setBlockReason(null);
    return true;
  }

  async function runItem(item: ParticipantMediaMenuItem, target = item.targets?.[0]) {
    if (item.id === "PROFILE" && item.href) {
      if (onProfile) onProfile(item.href);
      else if (typeof window !== "undefined") window.location.assign(item.href);
      return;
    }
    if (item.id === "PRIVATE_TALK") {
      const ok = await assertPersonalOneToOne();
      if (!ok) return;
      onPrivateTalk?.(participantId);
      return;
    }
    if (!item.command) return;
    if (item.command === "MEDIA.ASSIGN_TO_MONITOR" && target) {
      const ok = await assertPersonalOneToOne();
      if (!ok) return;
      commandBus.execute("MEDIA.ASSIGN_TO_MONITOR", { participantId, target });
      return;
    }
    if (item.command === "MEDIA.REMOVE_FROM_MONITOR" && target) {
      commandBus.execute("MEDIA.REMOVE_FROM_MONITOR", { target });
      return;
    }
    if (item.command === "MEDIA.PIN_AUDIO") {
      const ok = await assertPersonalOneToOne();
      if (!ok) return;
    }
    commandBus.execute(item.command as PersonalMediaCommand, { participantId } as never);
  }

  return (
    <div style={{ position: "relative", pointerEvents: "auto" }} data-personal-media-context-menu="true">
      <button type="button" onClick={() => setOpen((v) => !v)} style={chevronBtn} aria-expanded={open}>
        {open ? "⌃" : "›"}
      </button>
      {open ? (
        <div style={menu}>
          {blockReason ? <div style={blockedNote}>{blockReason}</div> : null}
          {items.map((item) => {
            const nested =
              item.id === "WATCH_ON" || item.id === "MOVE_TO" || item.id === "REMOVE_FROM_MONITOR"
                ? item.id
                : null;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  style={itemBtn}
                  onClick={() => {
                    if (nested) setExpanded((cur) => (cur === nested ? null : nested));
                    else void runItem(item);
                  }}
                >
                  {item.label}
                  {nested ? " ›" : ""}
                </button>
                {nested && expanded === nested ? (
                  <div style={{ paddingLeft: 8 }}>
                    {(item.targets ?? []).length === 0 ? (
                      <div style={emptySlot}>No available slots.</div>
                    ) : (
                      (item.targets ?? []).map((target) => (
                        <button
                          key={`${target.monitorId}:${target.slotId}`}
                          type="button"
                          style={subBtn}
                          onClick={() => void runItem(item, target)}
                        >
                          {labelMonitorTarget(target)}
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const emptyMount: CSSProperties = {
  fontSize: 10,
  color: "rgba(255,255,255,0.4)",
  pointerEvents: "none",
};

const chevronBtn: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: `1px solid ${GOLD}66`,
  background: `${GOLD}18`,
  color: GOLD,
  fontWeight: 900,
  cursor: "pointer",
};

const menu: CSSProperties = {
  position: "absolute",
  bottom: 36,
  left: 0,
  minWidth: 220,
  padding: 8,
  borderRadius: 12,
  border: `1px solid ${CYAN}55`,
  background: "rgba(6,6,20,0.96)",
  zIndex: 150,
};

const itemBtn: CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.06em",
  padding: "7px 8px",
  cursor: "pointer",
};

const subBtn: CSSProperties = {
  ...itemBtn,
  color: CYAN,
  fontWeight: 700,
};

const emptySlot: CSSProperties = {
  color: "rgba(255,255,255,0.4)",
  fontSize: 10,
  padding: "4px 8px",
};

const blockedNote: CSSProperties = {
  color: "#fca5a5",
  fontSize: 10,
  fontWeight: 700,
  padding: "6px 8px",
  marginBottom: 4,
  borderRadius: 8,
  border: "1px solid rgba(252,165,165,0.35)",
  background: "rgba(127,29,29,0.35)",
};
