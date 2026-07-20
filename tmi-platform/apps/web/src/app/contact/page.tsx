"use client";

import React, { useState } from "react";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ background: "#050510", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <GlobalTmiHeader />
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#00FFFF", marginBottom: 16 }}>
          Contact TMI Support & Business
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 24 }}>
          Have a question about venue booking, performer registration, Diamond memberships, or technical support? Send us a message below.
        </p>

        {submitted ? (
          <div style={{ padding: 20, borderRadius: 12, background: "rgba(0,255,255,0.1)", border: "1px solid #00FFFF", color: "#fff", textAlign: "center" }}>
            <h3 style={{ fontSize: 18, color: "#00FFFF", margin: 0 }}>Thank You!</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
              Your inquiry has been received. Our team will get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>
                YOUR NAME
              </label>
              <input
                required
                type="text"
                placeholder="Enter your name"
                style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>
                EMAIL ADDRESS
              </label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>
                MESSAGE / INQUIRY
              </label>
              <textarea
                required
                rows={5}
                placeholder="How can we help you?"
                style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              style={{ padding: "12px 20px", borderRadius: 8, background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", border: "none", color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer", marginTop: 8 }}
            >
              SEND MESSAGE
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
