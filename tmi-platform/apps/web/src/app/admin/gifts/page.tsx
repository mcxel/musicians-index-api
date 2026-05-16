import Link from "next/link";
import { InviteGrantEngine } from "@/lib/invites/InviteGrantEngine";
import { GiftMembershipEngine } from "@/lib/subscriptions/GiftMembershipEngine";
import type { GiftAccountRole, GiftTier } from "@/lib/subscriptions/GiftMembershipEngine";

type AdminGiftsPageProps = {
  searchParams: Promise<{
    action?: string;
    accountId?: string;
    giftId?: string;
    tier?: string;
    reason?: string;
    email?: string;
    role?: string;
  }>;
};

const ROLES: GiftAccountRole[] = ["artist", "fan", "venue", "producer", "sponsor", "advertiser"];
const TIERS: GiftTier[] = ["free", "pro", "bronze", "gold", "platinum", "diamond"];

function safeRole(value?: string): GiftAccountRole {
  return ROLES.includes((value ?? "").toLowerCase() as GiftAccountRole)
    ? ((value ?? "").toLowerCase() as GiftAccountRole)
    : "artist";
}

function safeTier(value?: string): GiftTier {
  return TIERS.includes((value ?? "").toLowerCase() as GiftTier)
    ? ((value ?? "").toLowerCase() as GiftTier)
    : "diamond";
}

export default async function AdminGiftsPage({ searchParams }: AdminGiftsPageProps) {
  const query = await searchParams;
  let actionMessage = "";

  if (query.action === "grant" && query.email) {
    try {
      const grant = InviteGrantEngine.grantAndSendInvite({
        recipientEmail: query.email,
        inviterId: "admin-system",
        role: safeRole(query.role),
        tier: safeTier(query.tier),
        source: "admin",
      });
      actionMessage = `Gifted membership granted and invite sent: ${grant.giftId}`;
    } catch (error) {
      actionMessage = error instanceof Error ? error.message : "Grant failed";
    }
  }

  if (query.action === "upgrade" && query.accountId) {
    try {
      const updated = InviteGrantEngine.upgradeGiftedMembership(query.accountId, safeTier(query.tier));
      actionMessage = `Upgraded ${updated.accountId} to ${updated.tier}`;
    } catch (error) {
      actionMessage = error instanceof Error ? error.message : "Upgrade failed";
    }
  }

  if (query.action === "revoke" && (query.accountId || query.giftId)) {
    const ok = InviteGrantEngine.revokeGiftedMembership({
      accountId: query.accountId,
      giftId: query.giftId,
      reason: query.reason ?? "admin-revoke",
    });
    actionMessage = ok ? "Gift membership revoked" : "Unable to revoke gift membership";
  }

  const giftedAccounts = GiftMembershipEngine.listGiftedAccounts();
  const pendingGrants = GiftMembershipEngine.listPendingGrants();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Admin Gifts</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>
          Grant, revoke, and upgrade gifted memberships. View pending and active gifted accounts.
        </p>

        {actionMessage && <div style={{ marginTop: 12, color: "#8fffcf" }}>{actionMessage}</div>}

        <section style={{ marginTop: 16, border: "1px solid rgba(255,215,0,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.08)" }}>
          <strong>Quick Gift Actions</strong>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            <Link href="/admin/gifts?action=grant&email=gift-artist@example.com&role=artist&tier=diamond" style={{ color: "#ffe6a0", textDecoration: "none" }}>
              Grant Diamond Artist Gift
            </Link>
            <Link href="/admin/gifts?action=grant&email=gift-fan@example.com&role=fan&tier=pro" style={{ color: "#ffe6a0", textDecoration: "none" }}>
              Grant Pro Fan Gift
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: 0, fontSize: 24, color: "#00FFFF" }}>Pending Gift Grants</h2>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {pendingGrants.length === 0 ? (
              <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                No pending grants.
              </div>
            ) : (
              pendingGrants.map((grant) => (
                <div key={grant.giftId} style={{ border: "1px solid rgba(0,255,255,0.34)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.06)" }}>
                  <strong>{grant.giftId}</strong>
                  <div style={{ marginTop: 4, color: "#dff" }}>
                    {grant.recipientEmail} · {grant.role} · {grant.tier}
                  </div>
                  <div style={{ marginTop: 4, color: "#c7d0ff" }}>Invite: {grant.inviteId ?? "none"}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: 0, fontSize: 24, color: "#FF2DAA" }}>Gifted Accounts</h2>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {giftedAccounts.length === 0 ? (
              <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                No gifted accounts yet.
              </div>
            ) : (
              giftedAccounts.map((account) => (
                <div key={account.accountId} style={{ border: "1px solid rgba(255,45,170,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,45,170,0.08)" }}>
                  <strong>{account.accountId}</strong>
                  <div style={{ marginTop: 4, color: "#f8d3ea" }}>
                    {account.email} · {account.role} · {account.tier} · {account.active ? "active" : "revoked"}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link href={`/admin/gifts?action=upgrade&accountId=${encodeURIComponent(account.accountId)}&tier=diamond`} style={{ color: "#FFD700", textDecoration: "none" }}>
                      Upgrade to Diamond
                    </Link>
                    <Link href={`/admin/gifts?action=revoke&accountId=${encodeURIComponent(account.accountId)}&reason=manual-admin-revoke`} style={{ color: "#ffb4c9", textDecoration: "none" }}>
                      Revoke Gift
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin/invites" style={{ color: "#00FFFF", textDecoration: "none" }}>Admin Invites</Link>
          <Link href="/account/invites" style={{ color: "#FFD700", textDecoration: "none" }}>Account Invites</Link>
        </div>
      </div>
    </main>
  );
}
