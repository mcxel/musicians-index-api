"use client";

import { useEffect, useMemo, useState } from "react";
import type { RoleType } from "@/types/avatar";

const ROLE_KEY   = "tmi_role";
const AVATAR_KEY = "tmi_avatar_snapshot";
const ROLE_EVENT   = "tmi:role-changed";
const AVATAR_EVENT = "tmi:avatar-changed";

const isValidRole = (value: string | null): value is RoleType =>
  value === "FAN" || value === "PERFORMER" || value === "ADMIN";

export type AvatarSnapshot = {
  displayName: string;
  skin: string;
  hair: string;
  outfit: string;
  bodyHeight: number; // 0-100
  bodyMass: number;   // 0-100
};

const DEFAULT_AVATAR: AvatarSnapshot = {
  displayName: "Your Avatar",
  skin: "#c07848",
  hair: "Fade",
  outfit: "Street Fit",
  bodyHeight: 50,
  bodyMass: 50,
};

function readAvatarSnapshot(): AvatarSnapshot {
  if (typeof window === "undefined") return DEFAULT_AVATAR;
  try {
    const raw = window.localStorage.getItem(AVATAR_KEY);
    if (!raw) return DEFAULT_AVATAR;
    return { ...DEFAULT_AVATAR, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AVATAR;
  }
}

export function useOverseerDeck() {
  const [role, setRoleState] = useState<RoleType>("FAN");
  const [avatarState, setAvatarState] = useState<AvatarSnapshot>(DEFAULT_AVATAR);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(ROLE_KEY);
    if (isValidRole(saved)) setRoleState(saved);
    setAvatarState(readAvatarSnapshot());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onRoleChanged = (event: Event) => {
      const custom = event as CustomEvent<{ role?: RoleType }>;
      const incoming = custom.detail?.role;
      if (incoming && isValidRole(incoming)) { setRoleState(incoming); return; }
      const saved = window.localStorage.getItem(ROLE_KEY);
      if (isValidRole(saved)) setRoleState(saved);
    };
    const onAvatarChanged = (event: Event) => {
      const custom = event as CustomEvent<Partial<AvatarSnapshot>>;
      setAvatarState((prev) => ({ ...prev, ...custom.detail }));
    };
    window.addEventListener(ROLE_EVENT, onRoleChanged);
    window.addEventListener(AVATAR_EVENT, onAvatarChanged);
    return () => {
      window.removeEventListener(ROLE_EVENT, onRoleChanged);
      window.removeEventListener(AVATAR_EVENT, onAvatarChanged);
    };
  }, []);

  const setRole = (nextRole: RoleType) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_KEY, nextRole);
      window.dispatchEvent(new CustomEvent(ROLE_EVENT, { detail: { role: nextRole } }));
    }
    setRoleState(nextRole);
  };

  const saveAvatarSnapshot = (patch: Partial<AvatarSnapshot>) => {
    const next = { ...avatarState, ...patch };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AVATAR_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: patch }));
    }
    setAvatarState(next);
  };

  return useMemo(
    () => ({
      currentRole: role,
      setRole,
      isAdmin:     role === "ADMIN",
      isPerformer: role === "PERFORMER",
      isFan:       role === "FAN",
      avatarState,
      saveAvatarSnapshot,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, avatarState],
  );
}
