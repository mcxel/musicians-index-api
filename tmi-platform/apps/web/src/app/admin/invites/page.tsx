import Link from "next/link";
import { InviteGrantEngine } from "@/lib/invites/InviteGrantEngine";
import { InviteRecoveryEngine } from "@/lib/invites/InviteRecoveryEngine";
import type { GiftAccountRole, GiftSource, GiftTier } from "@/lib/subscriptions/GiftMembershipEngine";

type AdminInvitesPageProps = {
  searchParams: Promise<{
    action?: string;
    email?: string;
    role?: string;
    tier?: string;
    source?: string;
    inviteId?: string;
    relation?: string;
  }>;
};

const ROLES: GiftAccountRole[] = ["artist", "fan", "venue", "producer", "sponsor", "advertiser"];
const TIERS: GiftTier[] = ["free", "pro", "bronze", "gold", "platinum", "diamond"];
const SOURCES: GiftSource[] = ["admin", "friend", "family"];

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

function safeSource(value?: string): GiftSource {
  return SOURCES.includes((value ?? "").toLowerCase() as GiftSource)
    ? ((value ?? "").toLowerCase() as GiftSource)
    : "admin";
}

export default async function AdminInvitesPage({ searchParams }: AdminInvitesPageProps) {
  const query = await searchParams;
  let actionMessage = "";

  if (query.action === "send" && query.email) {
    try {
      const source = safeSource(query.source);
      const result = InviteGrantEngine.grantAndSendInvite({
        recipientEmail: query.email,
        inviterId: "admin-system",
        role: safeRole(query.role),
        tier: safeTier(query.tier),
        source,
        friendInvite: query.relation === "friend" || source === "friend",
        familyInvite: query.relation === "family" || source === "family",
      });
      actionMessage = `Invite sent (${result.invite.inviteId}) with gifted ${result.invite.tier} ${result.invite.role} tier.`;
    } catch (error) {
      actionMessage = error instanceof Error ? error.message : "Failed to send invite";
    }
  }

  if (query.action === "resend" && query.inviteId) {
    try {
      const result = InviteRecoveryEngine.resendInvite(query.inviteId, "admin-system");
      actionMessage = result.resent
        ? `Invite reissued and resent (${result.invite.inviteId}).`
        : `Unable to resend (${result.reason}).`;
    } catch (error) {
      actionMessage = error instanceof Error ? error.message : "Failed to resend invite";
    }
  }

  const { pending, accepted } = InviteGrantEngine.listPendingAndAccepted();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Admin Invites</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>
          Send, resend, and track secure invite links with gifted membership attachment.
        </p>

        {actionMessage && <div style={{ marginTop: 12, color: "#8fffcf" }}>{actionMessage}</div>}

        <section style={{ marginTop: 16, border: "1px solid rgba(255,215,0,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.08)" }}>
          <strong>Quick Send Templates</strong>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            <Link href="/admin/invites?action=send&email=sample-artist@example.com&role=artist&tier=diamond&source=admin" style={{ color: "#ffe6a0", textDecoration: "none" }}>
              Send Diamond Artist Invite
            </Link>
            <Link href="/admin/invites?action=send&email=sample-friend@example.com&role=fan&tier=pro&source=friend&relation=friend" style={{ color: "#ffe6a0", textDecoration: "none" }}>
              Send Friend Invite
            </Link>
            <Link href="/admin/invites?action=send&email=sample-family@example.com&role=fan&tier=gold&source=family&relation=family" style={{ color: "#ffe6a0", textDecoration: "none" }}>
              Send Family Invite
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: 0, fontSize: 24, color: "#00FFFF" }}>Pending / Recoverable</h2>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {pending.length === 0 ? (
              <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                No pending invites.
              </div>
            ) : (
              pending.map((invite) => (
                <div key={invite.inviteId} style={{ border: "1px solid rgba(0,255,255,0.34)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.06)" }}>
                  <strong>{invite.inviteId}</strong>
                  <div style={{ marginTop: 4, color: "#dff" }}>
                    {invite.recipientEmail} · {invite.role} · {invite.tier} · {invite.status}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Link href={`/admin/invites?action=resend&inviteId=${invite.inviteId}`} style={{ color: "#FFD700", textDecoration: "none" }}>
                      Resend / Reissue Link
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: 0, fontSize: 24, color: "#FF2DAA" }}>Accepted</h2>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {accepted.length === 0 ? (
              <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                No accepted invites yet.
              </div>
            ) : (
              accepted.map((invite) => (
                <div key={invite.inviteId} style={{ border: "1px solid rgba(255,45,170,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,45,170,0.08)" }}>
                  <strong>{invite.inviteId}</strong>
                  <div style={{ marginTop: 4, color: "#f8d3ea" }}>
                    {invite.recipientEmail} · account {invite.accountId ?? "unknown"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin/gifts" style={{ color: "#00FFFF", textDecoration: "none" }}>Gift Memberships</Link>
          <Link href="/account/invites" style={{ color: "#FFD700", textDecoration: "none" }}>Account Invites</Link>
        </div>
      </div>
    </main>
  );
}
