"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const VENUE_NAMES: Record<string, string> = {
  "the-underground": "The Underground",
  "jakarta-arena": "Jakarta Arena",
};

function BookingForm({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const slotId = searchParams?.get("slot") ?? "";
  const slotPrice = Number(searchParams?.get("price") ?? 2800);

  const venueName = VENUE_NAMES[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const [form, setForm] = useState({
    artistName: "",
    contactEmail: "",
    eventDate: "",
    startTime: "20:00",
    endTime: "00:00",
    expectedAttendance: "",
    eventType: "concert",
    additionalRequests: "",
    soundTech: false,
    security: false,
    catering: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const soundTechFee = form.soundTech ? 200 : 0;
  const securityFee = form.security ? 150 : 0;
  const cateringFee = form.catering ? 400 : 0;
  const totalEstimate = slotPrice + soundTechFee + securityFee + cateringFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88", marginBottom: 10 }}>Booking Request Sent!</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Your booking request for {venueName} has been submitted. The venue team will contact you within 24 hours to confirm availability.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={`/venues/${slug}`} style={{ padding: "11px 22px", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, color: "#00FF88", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
            ← Back to Venue
          </Link>
          <Link href="/booking/calendar" style={{ padding: "11px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
            View Booking Calendar
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Artist / Performer Name *</label>
          <input required value={form.artistName} onChange={e => setForm(p => ({ ...p, artistName: e.target.value }))}
            placeholder="Your name or act name" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contact Email *</label>
          <input required type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
            placeholder="you@example.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Event Date *</label>
          <input required type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))}
            style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Event Type</label>
          <select value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))} style={inputStyle}>
            <option value="concert">Concert</option>
            <option value="showcase">Showcase</option>
            <option value="cypher">Cypher / Battle</option>
            <option value="album-release">Album Release</option>
            <option value="private">Private Event</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Start Time</label>
          <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>End Time</label>
          <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Expected Attendance *</label>
          <input required type="number" min="1" value={form.expectedAttendance} onChange={e => setForm(p => ({ ...p, expectedAttendance: e.target.value }))}
            placeholder="e.g. 250" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Additional Requests</label>
        <textarea value={form.additionalRequests} onChange={e => setForm(p => ({ ...p, additionalRequests: e.target.value }))}
          placeholder="Stage setup, equipment needs, special requirements, rider notes..."
          rows={4} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      {/* Add-ons */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", marginBottom: 12 }}>ADD-ONS</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "soundTech",  label: "Sound Tech",  price: 200, icon: "🎚️" },
            { key: "security",   label: "Security",    price: 150, icon: "🛡️" },
            { key: "catering",   label: "Catering",    price: 400, icon: "🍽️" },
          ].map(addon => (
            <div key={addon.key}
              onClick={() => setForm(p => ({ ...p, [addon.key]: !p[addon.key as keyof typeof p] }))}
              style={{
                padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${form[addon.key as keyof typeof form] ? "#FFD700" : "rgba(255,255,255,0.12)"}`,
                background: form[addon.key as keyof typeof form] ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.02)",
                display: "flex", gap: 8, alignItems: "center",
              }}>
              <span>{addon.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{addon.label}</span>
              <span style={{ fontSize: 11, color: "#FFD700" }}>+${addon.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Estimate */}
      <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 14, padding: "20px 22px", marginBottom: 22 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.2em", marginBottom: 12 }}>PRICE ESTIMATE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Venue base rate</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>${slotPrice.toLocaleString()}</span>
          </div>
          {form.soundTech && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Sound Tech</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>+$200</span>
            </div>
          )}
          {form.security && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Security</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>+$150</span>
            </div>
          )}
          {form.catering && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Catering</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>+$400</span>
            </div>
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Total Estimate</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#00FF88" }}>${totalEstimate.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          * Final price confirmed after venue approval. No charge until booking is accepted.
        </div>
      </div>

      <button type="submit" disabled={submitting}
        style={{ width: "100%", padding: "15px", background: submitting ? "rgba(255,107,53,0.4)" : "linear-gradient(135deg,#ff6b35,#ff3d00)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", cursor: submitting ? "not-allowed" : "pointer" }}>
        {submitting ? "Submitting Request..." : "Submit Booking Request →"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };

export default function VenueBookingPage({ params }: { params: { slug: string } }) {
  const venueName = VENUE_NAMES[params.slug] ?? params.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg,#040412,#06041a,#040412)", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,107,53,0.15)", padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href={`/venues/${params.slug}`} style={{ fontSize: 11, color: "rgba(255,107,53,0.7)", textDecoration: "none" }}>← {venueName}</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Booking Request</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#ff6b35", letterSpacing: "0.3em", marginBottom: 10 }}>VENUE BOOKING</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "0 0 6px" }}>Book {venueName}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
            Fill out the form below and the venue team will review your request within 24 hours.
          </p>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "28px 24px" }}>
            <Suspense fallback={<div style={{ color: "rgba(255,255,255,0.4)", padding: 20 }}>Loading form...</div>}>
              <BookingForm slug={params.slug} />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
