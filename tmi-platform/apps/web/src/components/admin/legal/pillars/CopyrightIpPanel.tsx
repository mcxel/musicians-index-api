"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import QuickClaimButton from "@/components/legal/QuickClaimButton";

type Snapshot = {
  counts: { greenEligible: number; yellowDefault: number; redRestricted: number; total: number };
  freestylePhases: Array<{ phase: string; soundtrackPolicy: string; recordingSafeRequired: boolean }>;
  notices: Array<{ id: string; title: string; body: string }>;
  assets: Array<{
    assetId: string;
    title?: string;
    licenseSource: string;
    contentIdStatus: string;
    hasRightsEvidence: boolean;
    recordingAllowed: boolean;
  }>;
  openComplaints: number;
  openDisputes?: number;
  activeTakedowns?: number;
  quickClaimOutcomes?: { VERIFIED: number; REVIEW: number; DISPUTED: number };
  quickClaims?: Array<{
    claimId: string;
    assetId: string;
    outcome: string;
    claimType: string;
    ownershipTransferred: false;
    contentDeleted: false;
  }>;
  playbackSamples?: Array<{
    assetId: string;
    classification: string;
    publicRebroadcastAllowed: boolean;
    monetizeAllowed: boolean;
  }>;
  complaints: Array<{ complaintId: string; status: string; claimantEmail: string; createdAt: string }>;
  policyStubs?: { takedown: string; counterNotice: string; repeatInfringer: string };
};

export default function CopyrightIpPanel() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    fetch("/api/admin/legal/rights", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        setSnap(data as Snapshot);
        setStatus("ready");
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus("error");
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>
          Copyright & Creator Recording Protection
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          RightsComplianceEngine under Legal — QuickClaim, ProtectedPlaybackGate, Dispute/Takedown/
          Counter-Notice, Repeat Infringer. Claims never instantly transfer ownership or delete content.
          Unknown rights default Yellow/RESTRICTED for high-risk uses. Not legal advice.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
        <Link href="/legal/copyright" style={linkBtn}>
          Copyright complaint intake →
        </Link>
        <Link href="/dmca" style={linkBtn}>
          DMCA policy →
        </Link>
        <QuickClaimButton assetId="beat-001" assetKind="BEAT" isOriginalUploader compact={false} />
      </div>

      {status === "loading" ? <div style={empty}>Loading rights registry…</div> : null}
      {status === "error" ? <div style={{ ...empty, color: "#FF8A8A" }}>{error}</div> : null}

      {status === "ready" && snap ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            <Stat label="Indexed" value={String(snap.counts.total)} accent="#00FFFF" />
            <Stat label="Green" value={String(snap.counts.greenEligible)} accent="#00FF88" />
            <Stat label="Yellow" value={String(snap.counts.yellowDefault)} accent="#FFD700" />
            <Stat label="Disputes" value={String(snap.openDisputes ?? 0)} accent="#FF2DAA" />
            <Stat
              label="IP / TD"
              value={`${snap.openComplaints}/${snap.activeTakedowns ?? 0}`}
              accent="#FF4444"
            />
          </div>

          <Section title="QuickClaim outcomes (no ownership transfer)">
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              VERIFIED {snap.quickClaimOutcomes?.VERIFIED ?? 0} · REVIEW{" "}
              {snap.quickClaimOutcomes?.REVIEW ?? 0} · DISPUTED {snap.quickClaimOutcomes?.DISPUTED ?? 0}
            </div>
            {(snap.quickClaims ?? []).length === 0 ? (
              <div style={empty}>No Quick Claims yet — use CLAIM MY WORK.</div>
            ) : (
              (snap.quickClaims ?? []).slice(0, 8).map((c) => (
                <div key={c.claimId} style={row}>
                  {c.claimId} · {c.claimType} · {c.outcome} · asset {c.assetId} · ownership:never ·
                  delete:never
                </div>
              ))
            )}
          </Section>

          <Section title="ProtectedPlaybackGate samples">
            {(snap.playbackSamples ?? []).length === 0 ? (
              <div style={empty}>No playback classifications yet.</div>
            ) : (
              (snap.playbackSamples ?? []).map((p) => (
                <div key={p.assetId} style={row}>
                  {p.assetId} · {p.classification} · rebroadcast:
                  {p.publicRebroadcastAllowed ? "yes" : "no"} · monetize:
                  {p.monetizeAllowed ? "yes" : "no"}
                </div>
              ))
            )}
          </Section>

          <Section title="FreestyleRightsController phases">
            {snap.freestylePhases.map((p) => (
              <div key={p.phase} style={row}>
                <strong style={{ color: "#FF2DAA" }}>{p.phase}</strong>
                <span style={{ color: "rgba(255,255,255,0.55)" }}> — {p.soundtrackPolicy}</span>
              </div>
            ))}
          </Section>

          <Section title="MediaRightsRegistry (seed — not a fake commercial catalog)">
            {snap.assets.slice(0, 12).map((a) => (
              <div key={a.assetId} style={row}>
                <span style={{ fontWeight: 800, color: "#fff" }}>{a.title ?? a.assetId}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: 8 }}>
                  {a.licenseSource} · {a.contentIdStatus} · evidence:{a.hasRightsEvidence ? "yes" : "no"}
                </span>
              </div>
            ))}
          </Section>

          <Section title="Policy stubs (counsel-reviewed placeholders)">
            <div style={{ ...row, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <span>{snap.policyStubs?.takedown}</span>
              <span>{snap.policyStubs?.counterNotice}</span>
              <span>{snap.policyStubs?.repeatInfringer}</span>
            </div>
          </Section>

          <Section title="Copyright complaints">
            {snap.complaints.length === 0 ? (
              <div style={empty}>No copyright complaints yet — honest empty state.</div>
            ) : (
              snap.complaints.map((c) => (
                <div key={c.complaintId} style={row}>
                  {c.complaintId} · {c.status} · {c.claimantEmail}
                </div>
              ))
            )}
          </Section>
        </>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: "#AA2DFF",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        border: `1px solid ${accent}44`,
        borderRadius: 10,
        padding: "10px 12px",
        background: `${accent}10`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          color: accent,
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 4 }}>{value}</div>
    </div>
  );
}

const empty = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  padding: 12,
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: 10,
  textAlign: "center" as const,
};

const row = {
  fontSize: 11,
  color: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "8px 10px",
  background: "rgba(255,255,255,0.02)",
  display: "flex" as const,
  flexWrap: "wrap" as const,
  alignItems: "center" as const,
};

const linkBtn = {
  fontSize: 10,
  fontWeight: 800,
  color: "#FFD700",
  textDecoration: "none",
  border: "1px solid rgba(255,215,0,0.4)",
  borderRadius: 8,
  padding: "7px 11px",
};
