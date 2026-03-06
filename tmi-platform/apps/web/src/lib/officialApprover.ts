import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const OFFICIAL_APPROVER_EMAILS = new Set(
  [
    "marcel@example.com",
    "micah@example.com",
    "jpaul@example.com",
  ].map((s) => s.toLowerCase())
);

/**
 * Returns a Response if blocked, otherwise returns session user.
 * Use this ONLY when an endpoint is trying to create/update "official" links.
 */
export async function requireOfficialApprover() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, res: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) };
  }

  const email = (session.user.email || "").toLowerCase();
  const allowed = email && OFFICIAL_APPROVER_EMAILS.has(email);

  if (!allowed) {
    return { ok: false as const, res: new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 }) };
  }

  return { ok: true as const, user: session.user };
}
