import Link from "next/link";
import { InviteAuthorityEngine } from "@/lib/invites/InviteAuthorityEngine";
import { InviteRecoveryEngine } from "@/lib/invites/InviteRecoveryEngine";

type AccountInvitesPageProps = {
  searchParams: Promise<{ email?: string; resendInviteId?: string }>;
};

export default async function AccountInvitesPage({ searchParams }: AccountInvitesPageProps) {
  const query = await searchParams;
  const email = (query.email ?? "").trim().toLowerCase();

  let resendMessage = "";
  if (query.resendInviteId) {
    try {
      const result = InviteRecoveryEngine.resendInvite(query.resendInviteId, "account-user");
      resendMessage = result.resent
        ? `Invite reissued and resent: ${result.invite.inviteId}`
        : `Unable to resend: ${result.reason}`;
    } catch (error) {
      resendMessage = error instanceof Error ? error.message : "Failed to resend invite";
    }
  }

  const invites = email ? InviteAuthorityEngine.listInvitesForEmail(email) : [];

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Account Invites</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>
          Track pending and accepted invites, and reissue expired links.
        </p>

        <div style={{ marginTop: 10, color: "#d4d4ea" }}>
          Use query: /account/invites?email=you@example.com
        </div>

        {resendMessage && <div style={{ marginTop: 12, color: "#8fffcf" }}>{resendMessage}</div>}

        <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {invites.length === 0 ? (
            <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.04)" }}>
              No invites found for this email yet.
            </div>
          ) : (
            invites.map((invite) => (
              <div key={invite.inviteId} style={{ border: "1px solid rgba(0,255,255,0.34)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.06)" }}>
                <strong>{invite.inviteId}</strong>
                <div style={{ marginTop: 6, color: "#dff" }}>
                  Role: {invite.role} · Tier: {invite.tier} · Status: {invite.status}
                </div>
                <div style={{ marginTop: 6, color: "#c7d0ff" }}>
                  Expires: {new Date(invite.currentTokenExpiresAt).toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/account/invites?email=${encodeURIComponent(invite.recipientEmail)}&resendInviteId=${invite.inviteId}`} style={{ color: "#FFD700", textDecoration: "none" }}>
                    Resend Invite Link
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin/invites" style={{ color: "#00FFFF", textDecoration: "none" }}>Admin Invites</Link>
          <Link href="/admin/gifts" style={{ color: "#FF2DAA", textDecoration: "none" }}>Admin Gifts</Link>
        </div>
      </div>
    </main>
  );
}
