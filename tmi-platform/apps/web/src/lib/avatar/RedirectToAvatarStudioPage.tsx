import { redirect } from "next/navigation";
import { avatarStudioHref } from "@/lib/avatar/avatarStudioRoute";

/** Server page body — obsolete decorator routes bookmark-safe redirect to studio. */
export default function RedirectToAvatarStudioPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  redirect(avatarStudioHref(searchParams));
}
