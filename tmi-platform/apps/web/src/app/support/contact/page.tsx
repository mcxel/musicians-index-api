"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  { id: "billing",   label: "Billing & Payments",   color: "#00FF88" },
  { id: "account",  label: "Account & Access",       color: "#00FFFF" },
  { id: "technical",label: "Technical Issue",        color: "#AA2DFF" },
  { id: "content",  label: "Content & Copyright",    color: "#FFD700" },
  { id: "safety",   label: "Safety & Reports",       color: "#FF2DAA" },
  { id: "other",    label: "Other",                  color: "rgba(255,255,255,0.5)" },
];

export default function SupportContactPage() {
  const searchParams = useSearchParams();
  const presetCategory = searchParams?.get?.("category") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(presetCategory);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to send. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main style={mainStyle}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 18 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#00FF88", marginBottom: 10 }}>
            Message Received
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 28 }}>
            We received your message and will respond to <strong>{email}</strong> within 24 hours.
          </p>
          <Link
            href="/support"
            style={{ padding: "10px 22px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8, color: "#00FF88", fontWeight: 700, fontSize: 12, textDecoration: "none" }}
          >
            Back to Support
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          <Link href="/support" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Support</Link>
          <span>›</span>
          <span style={{ color: "#00FFFF" }}>Contact</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.35em", marginBottom: 8 }}>
            CONTACT SUPPORT
          </div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 10px" }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.7 }}>
            Fill out the form and our team will get back to you within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>NAME *</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>EMAIL *</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>CATEGORY *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    border: `1px solid ${category === cat.id ? cat.color : "rgba(255,255,255,0.1)"}`,
                    background: category === cat.id ? cat.color + "12" : "rgba(255,255,255,0.02)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: category === cat.id ? cat.color : "rgba(255,255,255,0.6)" }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>MESSAGE *</label>
            <textarea
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue in detail. Include any error messages, transaction IDs, or steps to reproduce..."
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,45,45,0.08)", border: "1px solid rgba(255,45,45,0.25)", borderRadius: 8, fontSize: 12, color: "#ff6666" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name || !email || !category || !message}
            style={{
              width: "100%",
              padding: "13px",
              background: (!name || !email || !category || !message || submitting)
                ? "rgba(0,255,255,0.25)"
                : "linear-gradient(135deg,#00FFFF,#00FF88)",
              color: "#050510",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.06em",
              borderRadius: 10,
              border: "none",
              cursor: (!name || !email || !category || !message || submitting) ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Sending…" : "Send Message →"}
          </button>
        </form>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 50% -10%, rgba(0,255,255,0.07), transparent 40%), #050510",
  color: "#fff",
  fontFamily: "'Inter', sans-serif",
  paddingBottom: 80,
};
const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  color: "rgba(255,255,255,0.5)",
  letterSpacing: "0.18em",
  display: "block",
  marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
