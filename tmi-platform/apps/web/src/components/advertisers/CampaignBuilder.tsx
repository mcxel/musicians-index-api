"use client";

import { useState } from "react";

type CampaignFormat = "banner" | "billboard" | "pre-roll" | "sponsored-post" | "venue-wrap";
type CampaignStatus = "draft" | "active" | "paused" | "completed";

type Campaign = {
  id: string;
  name: string;
  format: CampaignFormat;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  venueSlug?: string;
};

const SEED_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Crown Stage Summer Push", format: "billboard",     budget: 4000, spent: 1840, impressions: 28400, clicks: 1192, startDate: "2026-05-01", endDate: "2026-06-30", status: "active",    venueSlug: "crown-stage"   },
  { id: "c2", name: "Artist Spotlight Week",   format: "sponsored-post",budget: 1200, spent: 880,  impressions: 14200, clicks: 604,  startDate: "2026-04-15", endDate: "2026-04-30", status: "completed", venueSlug: undefined       },
  { id: "c3", name: "Pulse Arena Venue Wrap",  format: "venue-wrap",    budget: 8000, spent: 0,    impressions: 0,     clicks: 0,    startDate: "2026-06-01", endDate: "2026-07-31", status: "draft",     venueSlug: "pulse-arena"   },
];

const STATUS_COLOR: Record<CampaignStatus, string> = {
  draft:     "#64748b",
  active:    "#22c55e",
  paused:    "#f59e0b",
  completed: "#94a3b8",
};

const FORMAT_OPTIONS: CampaignFormat[] = ["banner", "billboard", "pre-roll", "sponsored-post", "venue-wrap"];

type CampaignBuilderProps = {
  advertiserSlug: string;
};

export default function CampaignBuilder({ advertiserSlug }: CampaignBuilderProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", format: "billboard" as CampaignFormat, budget: "", venueSlug: "", startDate: "", endDate: "" });

  function handleCreate() {
    if (!form.name || !form.budget) return;
    const newCampaign: Campaign = {
      id: `c${Date.now()}`,
      name: form.name,
      format: form.format,
      budget: Number(form.budget),
      spent: 0,
      impressions: 0,
      clicks: 0,
      startDate: form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.endDate || "",
      status: "draft",
      venueSlug: form.venueSlug || undefined,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    setCreating(false);
    setForm({ name: "", format: "billboard", budget: "", venueSlug: "", startDate: "", endDate: "" });
  }

  function toggleStatus(id: string) {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === "active" ? "paused" : c.status === "paused" ? "active" : c.status };
    }));
  }

  void advertiserSlug;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ color: "#fcd34d", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>CAMPAIGN BUILDER</strong>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          style={{ borderRadius: 6, border: "1px solid rgba(251,191,36,0.5)", background: creating ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.07)", color: "#fde68a", fontSize: 10, fontWeight: 700, padding: "5px 12px", cursor: "pointer", letterSpacing: "0.08em" }}
        >
          {creating ? "CANCEL" : "+ NEW CAMPAIGN"}
        </button>
      </div>

      {creating && (
        <div style={{ border: "1px solid rgba(251,191,36,0.35)", borderRadius: 12, background: "rgba(40,20,5,0.6)", padding: 14, display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 10, color: "#fcd34d", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>New Campaign</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Campaign Name", key: "name",      type: "text",   placeholder: "Summer Push..." },
              { label: "Budget (USD)",  key: "budget",    type: "number", placeholder: "5000"           },
              { label: "Venue Slug",    key: "venueSlug", type: "text",   placeholder: "crown-stage"    },
              { label: "Start Date",   key: "startDate", type: "date",   placeholder: ""               },
              { label: "End Date",     key: "endDate",   type: "date",   placeholder: ""               },
            ].map((field) => (
              <label key={field.key} style={{ display: "grid", gap: 3 }}>
                <span style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>{field.label}</span>
                <input
                  type={field.type}
                  value={(form as Record<string, string>)[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ background: "#0f172a", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 6, color: "#e2e8f0", padding: "5px 8px", fontSize: 10 }}
                />
              </label>
            ))}
            <label style={{ display: "grid", gap: 3 }}>
              <span style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Format</span>
              <select value={form.format} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value as CampaignFormat }))} style={{ background: "#0f172a", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 6, color: "#e2e8f0", padding: "5px 8px", fontSize: 10 }}>
                {FORMAT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          </div>
          <button type="button" onClick={handleCreate} style={{ borderRadius: 8, border: "1px solid rgba(34,197,94,0.5)", background: "rgba(5,46,22,0.4)", color: "#86efac", fontSize: 11, fontWeight: 700, padding: "8px 0", cursor: "pointer", letterSpacing: "0.1em" }}>
            CREATE CAMPAIGN
          </button>
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {campaigns.map((c) => (
          <div key={c.id} style={{ border: `1px solid ${STATUS_COLOR[c.status]}33`, borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <strong style={{ color: "#f1f5f9", fontSize: 11 }}>{c.name}</strong>
                  <span style={{ fontSize: 8, fontWeight: 700, color: STATUS_COLOR[c.status], border: `1px solid ${STATUS_COLOR[c.status]}55`, borderRadius: 3, padding: "1px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{c.status}</span>
                  <span style={{ fontSize: 9, color: "#64748b", textTransform: "capitalize" }}>{c.format}</span>
                </div>
                {c.venueSlug && <p style={{ margin: 0, fontSize: 9, color: "#475569" }}>Venue: {c.venueSlug}</p>}
              </div>
              {(c.status === "active" || c.status === "paused") && (
                <button type="button" onClick={() => toggleStatus(c.id)} style={{ borderRadius: 5, border: `1px solid ${STATUS_COLOR[c.status]}55`, background: "rgba(0,0,0,0.3)", color: STATUS_COLOR[c.status], fontSize: 9, fontWeight: 700, padding: "3px 9px", cursor: "pointer" }}>
                  {c.status === "active" ? "PAUSE" : "RESUME"}
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[
                { label: "Budget",      value: `$${c.budget.toLocaleString()}` },
                { label: "Spent",       value: `$${c.spent.toLocaleString()}`  },
                { label: "Impressions", value: c.impressions.toLocaleString()  },
                { label: "Clicks",      value: c.clicks.toLocaleString()       },
              ].map((m) => (
                <div key={m.label} style={{ borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", padding: "4px 7px" }}>
                  <p style={{ margin: 0, fontSize: 8, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>{m.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
