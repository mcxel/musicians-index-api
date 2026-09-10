import { redirect } from "next/navigation";
import { canonicalPublicPath } from "@/lib/identity/PublicProfileRuntime";

// Legacy alias — canonical destination is /p/[username] (ORBITAL Wheel
// Profile Truth hotfix), not /profile/performer/[slug]. This is the single
// point every /performers/${slug} link across the app funnels through, so
// fixing it here converges all of them without touching each call site.
export default function PerformerAliasPage({ params }: { params: { slug: string } }) {
  redirect(canonicalPublicPath(params.slug));
}
