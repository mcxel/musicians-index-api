/**
 * Pure contract for Avatar Studio save UI — never claim SAVED without durable ok.
 */

export type AvatarSaveUiStatus = "idle" | "saving" | "saved" | "error";

export type AvatarSaveApiPayload = {
  ok?: boolean;
  durable?: boolean;
  error?: string;
  detail?: string;
  AvatarProfile?: { updatedAt?: string };
};

export function resolveAvatarSaveUiFromResponse(input: {
  httpOk: boolean;
  status: number;
  payload: AvatarSaveApiPayload | null;
}): { status: Exclude<AvatarSaveUiStatus, "idle" | "saving">; savedAt: string | null; error: string | null } {
  if (!input.httpOk || !input.payload || input.payload.ok !== true || input.payload.durable !== true) {
    return {
      status: "error",
      savedAt: null,
      error:
        input.payload?.detail ||
        input.payload?.error ||
        `Avatar save failed (HTTP ${input.status})`,
    };
  }
  return {
    status: "saved",
    savedAt: input.payload.AvatarProfile?.updatedAt ?? new Date().toISOString(),
    error: null,
  };
}
