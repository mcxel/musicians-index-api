/**
 * Canonical Avatar Studio destination — AvatarStudioExperience / AvatarForgePreview3D.
 * All decorate / customize / wardrobe / builder entries resolve here (same identity).
 */

export const AVATAR_STUDIO_PATH = "/avatar/studio";

/** Performer real-identity canvas — never Avatar Studio (Rule 26). */
export const PERFORMER_IDENTITY_PATH = "/performer/canvas";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function avatarStudioHref(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | string | null,
): string {
  let avatarId: string | undefined;
  if (!searchParams) {
    avatarId = undefined;
  } else if (typeof searchParams === "string") {
    const q = searchParams.startsWith("?") ? searchParams.slice(1) : searchParams;
    avatarId = new URLSearchParams(q).get("avatarId") ?? undefined;
  } else if (typeof URLSearchParams !== "undefined" && searchParams instanceof URLSearchParams) {
    avatarId = searchParams.get("avatarId") ?? undefined;
  } else {
    avatarId = firstParam(
      (searchParams as Record<string, string | string[] | undefined>).avatarId,
    );
  }
  if (avatarId) return `${AVATAR_STUDIO_PATH}?avatarId=${encodeURIComponent(avatarId)}`;
  return AVATAR_STUDIO_PATH;
}
