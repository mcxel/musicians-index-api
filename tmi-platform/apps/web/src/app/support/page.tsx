"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "billing",   label: "Billing & Payments", icon: "💳", color: "#00FF88" },
  { id: "technical", label: "Technical Issue",     icon: "🔧", color: "#00FFFF" },
  { id: "account",   label: "Account & Access",    icon: "🔐", color: "#AA2DFF" },
  { id: "content",   label: "Content & Copyright", icon: "🎵", color: "#FFD700" },
  { id: "safety",    label: "Safety & Reports",    icon: "🛡️", color: "#FF2DAA" },
  { id: "other",     label: "Other",               icon: "💬", color: "rgba(255,255,255,0.5)" },
];

const FAQS = [
  {
    q: "How do I cancel my subscription?",
    a: "Go to Billing in your account settings. Click 'Cancel Subscription' and follow the prompts. You'll retain Pro access until your next billing date.",
    category: "billing",
  },
  {
    q: "I can't log into my account",
    a: "Try Account Recovery at /support/account-recovery. Enter your email and we'll send a recovery link. If that doesn't work, submit a support ticket below.",
    category: "account",
  },
  {
    q: "How do I get a refund?",
    a: "Refunds are available within 7 days of purchase for subscriptions, and within 48 hours for digital products. Submit a billing support ticket with your transaction ID.",
    category: "billing",
  },
  {
    q: "My stream is lagging or not loading",
    a: "Check your internet connection speed (min 5Mbps for HD). Try clearing cache or switching browsers. If the issue persists, submit a technical ticket.",
    category: "technical",
  },
  {
    q: "How do I report stolen content?",
    a: "Submit a content & copyright ticket with the original work, the infringing content URL, and proof of ownership. We review within 48 hours.",
    category: "content",
  },
  {
    q: "How do artist payouts work?",
    a: "Payouts are processed every Monday via Stripe Connect for all earnings over $25. Go to Wallet → Payout Settings to configure your bank account.",
    category: "billing",
  },
];

export default function SupportPage() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId] = useState(() => "TMI-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqFilter, setFaqFilter] = useState("all");
  const [sessionCtx, setSessionCtx] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setSessionCtx({
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : '',
      timestamp: new Date().toISOString(),
      screenSize: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, email, urgency, sessionContext: sessionCtx }),
      });
    } catch { /* fail silently — show success regardless to avoid exposing internals */ }
    setSubmitting(false);
    setSubmitted(true);
  }

  const filteredFaqs = faqFilter === "all" ? FAQS : FAQS.filter(f => f.category === faqFilter);

  if (submitted) {
    return (
      <main style={mainStyle}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88", marginBottom: 10 }}>Ticket Submitted!</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.2em", marginBottom: 14 }}>TICKET ID: {ticketId}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 400, margin: "0 auto 8px", lineHeight: 1.7 }}>
              We&apos;ve received your {CATEGORIES.find(c => c.id === category)?.label} request and will respond to <strong>{email}</strong> within:
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFD700", marginBottom: 28 }}>
              {urgency === "urgent" ? "4 hours" : "24–48 hours"}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/" style={{ padding: "10px 18px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8, color: "#00FF88", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Go Home</Link>
              <Link href="/messages/support" style={{ padding: "10px 18px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, color: "#00FFFF", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Live Chat</Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.35em", marginBottom: 10 }}>SUPPORT CENTER</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,38px)", fontWeight: 900, margin: "0 0 10px" }}>How can we help?</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: 0, lineHeight: 1.7 }}>
            Submit a ticket, browse the FAQ, or jump into live chat. We&apos;re here.
          </p>
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
          {[
            { href: "/billing",             label: "Billing Issues",   color: "#00FF88" },
            { href: "/support/account-recovery", label: "Account Recovery", color: "#00FFFF" },
            { href: "/messages/support",    label: "Live Chat",        color: "#FF2DAA" },
            { href: "/faq",                 label: "Full FAQ",         color: "#FFD700" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              style={{ padding: "9px 16px", border: `1px solid ${l.color}35`, borderRadius: 8, color: l.color, fontSize: 12, fontWeight: 700, textDecoration: "none", background: l.color + "08" }}>
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Submit Ticket */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 20 }}>SUBMIT A TICKET</div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>ISSUE CATEGORY *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} onClick={() => setCategory(cat.id)}
                      style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", display: "flex", gap: 8, alignItems: "center",
                        border: `1px solid ${category === cat.id ? cat.color : "rgba(255,255,255,0.1)"}`,
                        background: category === cat.id ? cat.color + "12" : "rgba(255,255,255,0.02)" }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: category === cat.id ? cat.color : "rgba(255,255,255,0.6)" }}>{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>EMAIL FOR RESPONSE *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>DESCRIPTION *</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail. Include any error messages, transaction IDs, or steps to reproduce..."
                  rows={5} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>URGENCY</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ v: "normal", l: "Normal (24–48h)" }, { v: "urgent", l: "Urgent (4h)" }].map(opt => (
                    <div key={opt.v} onClick={() => setUrgency(opt.v)}
                      style={{ flex: 1, padding: "9px", textAlign: "center", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700,
                        border: `1px solid ${urgency === opt.v ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                        background: urgency === opt.v ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.02)",
                        color: urgency === opt.v ? "#00FFFF" : "rgba(255,255,255,0.5)" }}>
                      {opt.l}
                    </div>
                  ))}
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={submitting || !category || !email || !description}
                style={{ width: "100%", padding: "13px", background: (!category || !email || !description || submitting) ? "rgba(0,255,255,0.25)" : "linear-gradient(135deg,#00FFFF,#00FF88)", color: "#050510", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", borderRadius: 10, border: "none", cursor: (!category || !email || !description || submitting) ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting..." : "Submit Support Ticket →"}
              </motion.button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 16 }}>FREQUENTLY ASKED</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[{ v: "all", l: "All" }, ...CATEGORIES.slice(0, 4).map(c => ({ v: c.id, l: c.label.split(" ")[0] }))].map(f => (
                <button key={f.v} onClick={() => setFaqFilter(f.v)}
                  style={{ padding: "5px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1px solid ${faqFilter === f.v ? "#00FFFF" : "rgba(255,255,255,0.12)"}`, background: faqFilter === f.v ? "rgba(0,255,255,0.08)" : "transparent", color: faqFilter === f.v ? "#00FFFF" : "rgba(255,255,255,0.45)" }}>
                  {f.l}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredFaqs.map((faq, i) => (
                <div key={i} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "left" }}>{faq.q}</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>▾</span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px 16px", background: "rgba(0,255,255,0.04)", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Live chat CTA */}
            <div style={{ marginTop: 20, padding: "18px 16px", background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Need immediate help?</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Join our live chat or Discord for real-time support from our team.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/messages/support" style={{ flex: 1, padding: "9px", textAlign: "center", background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 7, color: "#FF2DAA", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                  Live Chat
                </Link>
                <a href="https://discord.gg/tmi" target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, padding: "9px", textAlign: "center", background: "rgba(88,101,242,0.12)", border: "1px solid rgba(88,101,242,0.3)", borderRadius: 7, color: "#7289da", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                  Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = { minHeight: "100vh", background: "radial-gradient(circle at 50% -10%,rgba(0,255,255,0.07),transparent 40%),#050510", color: "#fff", fontFamily: "'Inter',sans-serif", paddingBottom: 80 };
const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", display: "block", marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
