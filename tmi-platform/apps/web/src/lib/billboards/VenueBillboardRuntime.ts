import type { LobbyRuntimeState } from "@/lib/lobby/LobbyStateEngine";
import {
  selectBillboardChannels,
  type BillboardChannelId,
  type VenueBillboardSelection,
} from "@/lib/billboards/VenueBillboardStateSelector";

export type VenueBillboardRuntimeState = {
  activeChannel: BillboardChannelId;
  nextChannel: BillboardChannelId;
  selection: VenueBillboardSelection;
  phase: 0 | 1;
  rotateMs: number;
  cycleStartedAt: number;
};

export function computeBillboardRuntime(
  lobbyState: LobbyRuntimeState,
  now = Date.now(),
): VenueBillboardRuntimeState {
  const selection = selectBillboardChannels(lobbyState);
  const cycleIndex = Math.floor(now / selection.rotateMs) % 2;
  const phase = cycleIndex as 0 | 1;
  const activeChannel = phase === 0 ? selection.primary : selection.secondary;
  const nextChannel = phase === 0 ? selection.secondary : selection.primary;
  const cycleStartedAt = now - (now % selection.rotateMs);

  return {
    activeChannel,
    nextChannel,
    selection,
    phase,
    rotateMs: selection.rotateMs,
    cycleStartedAt,
  };
}

export function getNextRotationMs(runtime: VenueBillboardRuntimeState, now = Date.now()): number {
  const elapsed = now - runtime.cycleStartedAt;
  return Math.max(0, runtime.rotateMs - elapsed);
}
