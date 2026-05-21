"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FanOnboarding() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) router.push("/dashboard/fan");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0520", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1E0D3E", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 12, padding: 40, minWidth: 340 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: "#FFB800", letterSpacing: 2, marginBottom: 8 }}>
          FAN ONBOARDING
        </h1>
        <p style={{ color: "#C8A8E8", fontSize: 14, marginBottom: 24 }}>Join the community. Discover undiscovered artists first.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", background: "#150830", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 8, color: "#fff", fontSize: 15, marginBottom: 16, boxSizing: "border-box" }}
          />
          <button
            type="submit"
            style={{ width: "100%", padding: "12px", background: "#00E5FF", color: "#0D0520", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}
          >
            JOIN THE INDEX
          </button>
        </form>
      </div>
    </div>
  );
}
