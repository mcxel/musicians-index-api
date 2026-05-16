export type AvatarSeatBinding = {
  avatarId: string;
  seatId: string | null;
  roomId?: string;
  status: "unbound" | "bound";
  updatedAt: number;
};

const seatBindingMap = new Map<string, AvatarSeatBinding>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

export function startAvatarSeatBindingEngine(avatarId: string): AvatarSeatBinding {
  const k = key(avatarId);
  const state =
    seatBindingMap.get(k) ?? {
      avatarId: k,
      seatId: null,
      status: "unbound" as const,
      updatedAt: Date.now(),
    };
  seatBindingMap.set(k, state);
  return { ...state };
}

export function updateAvatarSeatBinding(
  avatarId: string,
  updates: Partial<Pick<AvatarSeatBinding, "seatId" | "roomId" | "status">>
): AvatarSeatBinding {
  const current = startAvatarSeatBindingEngine(avatarId);
  const next: AvatarSeatBinding = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };
  seatBindingMap.set(key(avatarId), next);
  return next;
}

export function bindAvatarToSeat(avatarId: string, seatId: string, roomId?: string): AvatarSeatBinding {
  return updateAvatarSeatBinding(avatarId, { seatId, roomId, status: "bound" });
}

export function unbindAvatarFromSeat(avatarId: string): AvatarSeatBinding {
  return updateAvatarSeatBinding(avatarId, { seatId: null, status: "unbound" });
}

export function recoverAvatarSeatBinding(avatarId: string): AvatarSeatBinding {
  return startAvatarSeatBindingEngine(avatarId);
}

export function repeatAvatarSeatBinding(avatarId: string): AvatarSeatBinding {
  return startAvatarSeatBindingEngine(avatarId);
}

export function returnAvatarSeatBinding(avatarId: string): AvatarSeatBinding {
  return startAvatarSeatBindingEngine(avatarId);
}
