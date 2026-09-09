import { redirect } from "next/navigation";
import { canonicalPublicPath } from "@/lib/identity/PublicProfileRuntime";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

// Legacy alias — this page used to duplicate /p/[username]'s DB lookup and
// rendering inline (a second profile-route authority, ORBITAL Wheel Profile
// Truth hotfix). /p/[username]'s resolveDbUser() already matches on
// userProfile.username, artistProfile.slug, id-prefix, or displayName — a
// strict superset of what this page looked up — so it's a safe redirect,
// not a functionality loss. Sibling role paths (/profile/performer/[slug],
// /profile/fan/[slug], /profile/artist|sponsor|venue|advertiser/[slug]) are
// unrelated routes and are not touched by this redirect.
export default function GenericProfileAliasPage({ params }: Props) {
  redirect(canonicalPublicPath(params.slug));
}
