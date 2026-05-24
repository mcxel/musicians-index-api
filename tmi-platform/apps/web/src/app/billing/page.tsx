"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface LivePlan {
  name: string;
  price: number;
  interval: string;
  nextBillingDate: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
}

interface LivePaymentMethod {
  brand: string;
  last4: string;
  expiry: string;
}

interface LiveInvoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  desc: string;
  pdfUrl: string | null;
}

interface BillingData {
  plan: LivePlan | null;
  paymentMethod: LivePaymentMethod | null;
  invoices: LiveInvoice[];
  tier: string;
}

const FREE_FEATURES = ["Watch all public shows", "Crowd vote (limited)", "Public leaderboards"];
const PLAN_FEATURES: Record<string, string[]> = {
  "Fan Pass":          ["All live rooms", "Unlimited crowd votes", "Seat selection", "Show recordings", "Fan badge"],
  "Performer":         ["Contest entries", "Performance analytics", "Profile page", "Prize eligibility", "Monthly Idol entries"],
  "VIP Season Pass":   ["VIP seating", "Backstage digital access", "Priority queue", "Exclusive NFT drops", "VIP badge"],
  "Advertiser":        ["Sponsor reads in shows", "Billboard placements", "Analytics dashboard", "Custom ad slots"],
  "Show Sponsor":      ["Named sponsor in 4 shows/month", "Prize co-sponsorship", "Host script integration", "Show naming rights"],
  "Venue Partner":     ["Full venue digital presence", "NFT venue pass issuance", "Custom room branding", "Revenue share"],
};

function planFeatures(name: string): string[] {
  return PLAN_FEATURES[name] ?? ["All live rooms", "HD streams", "No ads", "Bonus XP", "Priority support"];
}

export default function BillingPage() {
  const [data, setData]             = useState<BillingData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((d: BillingData) => setData(d))
      .catch(() => setData({ plan: null, paymentMethod: null, invoices: [], tier: "FREE" }))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdatePayment() {
    setUpdatingPayment(true);
    await new Promise((r) => setTimeout(r, 800));
    window.location.href = "/api/stripe/customer-portal";
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      paid:     { color: "#00FF88", bg: "rgba(0,255,136,0.1)" },
      open:     { color: "#00FFFF", bg: "rgba(0,255,255,0.1)" },
      void:     { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" },
      refunded: { color: "#FFD700", bg: "rgba(255,215,0,0.1)" },
      uncollectible: { color: "#FF2DAA", bg: "rgba(255,45,170,0.1)" },
    };
    const s = map[status] ?? map.paid;
    return (
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4, color: s.color, background: s.bg }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const plan = data?.plan ?? null;
  const pm   = data?.paymentMethod ?? null;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg,#040412,#06041a)", color: "#fff", paddingBottom: 80, fontFamily: "'Inter',sans-serif" }}>
      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !cancelDone && setShowCancelModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#0a0a1a", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 18, padding: "32px 28px", maxWidth: 420, width: "100%", textAlign: "center" }}>
              {cancelDone ? (
                <>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>😢</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#FFD700", marginBottom: 8 }}>Subscription Cancelled</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                    You&apos;ll retain access until {plan?.nextBillingDate ?? "the end of your billing period"}.
                  </div>
                  <button onClick={() => { setShowCancelModal(false); setCancelDone(false); }}
                    style={{ padding: "10px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    Close
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
                  <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Cancel {plan?.name ?? "subscription"}?</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24, lineHeight: 1.6 }}>
                    You&apos;ll lose access to all Pro features on {plan?.nextBillingDate ?? "your next billing date"}. You can resubscribe at any time.
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setShowCancelModal(false)}
                      style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      Keep Plan
                    </button>
                    <button onClick={() => {
                      setCancelDone(true);
                      // In production: POST /api/stripe/cancel-subscription
                    }}
                      style={{ flex: 1, padding: "11px", background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, color: "#FF2DAA", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                      Yes, Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 28px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/account" style={{ fontSize: 11, color: "rgba(0,255,255,0.7)", textDecoration: "none" }}>← My Account</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Billing & Subscriptions</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.3em", marginBottom: 8 }}>BILLING</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: 0 }}>Billing & Subscriptions</h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ height: 180, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Current Plan */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 16, padding: "22px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.2em", marginBottom: 14 }}>CURRENT PLAN</div>
                {plan ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{plan.name}</div>
                        <div style={{ fontSize: 14, color: "#00FF88", fontWeight: 800, marginTop: 4 }}>
                          ${plan.price.toFixed(2)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/{plan.interval}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}>
                        {plan.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      {planFeatures(plan.name).map((f) => (
                        <div key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ color: "#00FF88" }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
                      {plan.cancelAtPeriodEnd ? `Cancels on: ${plan.nextBillingDate}` : `Next billing: ${plan.nextBillingDate}`}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Free Access</div>
                    <div style={{ marginBottom: 14 }}>
                      {FREE_FEATURES.map((f) => (
                        <div key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>No active subscription</div>
                  </>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/pricing" style={{ flex: 1, padding: "9px 12px", background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 7, color: "#00FFFF", fontWeight: 700, fontSize: 11, textDecoration: "none", textAlign: "center" }}>
                    {plan ? "Change Plan" : "Subscribe"}
                  </Link>
                  {plan && (
                    <button onClick={() => setShowCancelModal(true)}
                      style={{ flex: 1, padding: "9px 12px", background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 7, color: "#FF2DAA", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16, padding: "22px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", marginBottom: 14 }}>PAYMENT METHOD</div>
                {pm ? (
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 36 }}>💳</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>
                        {pm.brand.charAt(0).toUpperCase() + pm.brand.slice(1)} ···· {pm.last4}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                        Expires {pm.expiry}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 36 }}>💳</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No payment method on file</div>
                  </div>
                )}
                <button onClick={handleUpdatePayment} disabled={updatingPayment}
                  style={{ width: "100%", padding: "10px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, color: "#FFD700", fontWeight: 700, fontSize: 12, cursor: updatingPayment ? "not-allowed" : "pointer" }}>
                  {updatingPayment ? "Redirecting to Stripe..." : pm ? "Update Payment Method" : "Add Payment Method"}
                </button>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>
                  Securely managed by Stripe
                </div>
              </motion.div>
            </div>

            {/* Billing History */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 20px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 16 }}>BILLING HISTORY</div>
              {data?.invoices && data.invoices.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {data.invoices.map((inv, i) => (
                    <motion.div key={inv.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.04 }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 8, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{inv.desc}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{inv.date}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {statusBadge(inv.status)}
                        <div style={{ fontSize: 14, fontWeight: 800, color: inv.status === "void" ? "rgba(255,255,255,0.4)" : "#fff" }}>
                          ${inv.amount.toFixed(2)}
                        </div>
                        {inv.pdfUrl ? (
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                            style={{ background: "none", border: "none", color: "rgba(0,255,255,0.6)", cursor: "pointer", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
                            PDF
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.15)" }}>PDF</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                  No billing history yet
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { href: "/pricing",   label: "Upgrade Plan",   color: "#00FFFF" },
                { href: "/account",   label: "My Account",     color: "#AA2DFF" },
                { href: "/support",   label: "Billing Support", color: "rgba(255,255,255,0.4)" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ padding: "10px 18px", border: `1px solid ${l.color}35`, borderRadius: 8, color: l.color, fontSize: 12, fontWeight: 700, textDecoration: "none", background: l.color + "08" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
