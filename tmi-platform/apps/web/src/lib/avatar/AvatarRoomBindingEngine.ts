export type AvatarRoomBinding = {
  avatarId: string;
  roomId: string | null;
  status: "outside" | "inside";
  updatedAt: number;
};

const roomBindingMap = new Map<string, AvatarRoomBinding>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

export function startAvatarRoomBindingEngine(avatarId: string): AvatarRoomBinding {
  const k = key(avatarId);
  const state =
    roomBindingMap.get(k) ?? {
      avatarId: k,
      roomId: null,
      status: "outside" as const,
      updatedAt: Date.now(),
    };
  roomBindingMap.set(k, state);
  return { ...state };
}

export function updateAvatarRoomBinding(
  avatarId: string,
  updates: Partial<Pick<AvatarRoomBinding, "roomId" | "status">>
): AvatarRoomBinding {
  const current = startAvatarRoomBindingEngine(avatarId);
  const next: AvatarRoomBinding = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };
  roomBindingMap.set(key(avatarId), next);
  return next;
}

export function bindAvatarToRoom(avatarId: string, roomId: string): AvatarRoomBinding {
  return updateAvatarRoomBinding(avatarId, { roomId, status: "inside" });
}

export function leaveAvatarRoom(avatarId: string): AvatarRoomBinding {
  return updateAvatarRoomBinding(avatarId, { roomId: null, status: "outside" });
}

export function rejoinAvatarRoom(avatarId: string, roomId: string): AvatarRoomBinding {
  return bindAvatarToRoom(avatarId, roomId);
}

export function recoverAvatarRoomBinding(avatarId: string): AvatarRoomBinding {
  return startAvatarRoomBindingEngine(avatarId);
}

export function repeatAvatarRoomBinding(avatarId: string): AvatarRoomBinding {
  return startAvatarRoomBindingEngine(avatarId);
}

export function returnAvatarRoomBinding(avatarId: string): AvatarRoomBinding {
  return startAvatarRoomBindingEngine(avatarId);
}
