"use client";

/**
 * PerformerBookingProfilePanel — canonical booking profile editor + BOOK ME state.
 * Shared with Discovery Wall / Map via BookingProfileStore (one profile, no duplicate DB).
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  emptyBookingProfile,
  type BookingProfile,
  type LookingForRole,
  type PerformanceType,
} from "@/lib/booking/BookingProfileStore";
import { BookingCanister } from "@/components/canisters/BookingCanister";

const CATEGORIES: PerformanceType[] = [
  "live_set",
  "dj",
  "comedy",
  "dance",
  "producer",
  "band",
  "virtual",
  "other",
];

const LOOKING: LookingForRole[] = [
  "singer",
  "rapper",
  "dj",
  "producer",
  "dancer",
  "comedian",
  "band",
  "instrumentalist",
  "promoter",
  "venue",
];

interface Props {
  entityId: string;
  entityType?: "performer" | "venue";
  publicCity?: string;
  publicRegion?: string;
  accent?: string;
}

export default function PerformerBookingProfilePanel({
  entityId,
  entityType = "performer",
  publicCity = "",
  publicRegion = "",
  accent = "#00FF88",
}: Props) {
  const [profile, setProfile] = useState<BookingProfile>(() =>
    emptyBookingProfile(entityId, entityType, publicCity, publicRegion),
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/booking/profile?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { profile?: BookingProfile };
      if (data.profile) setProfile(data.profile);
    } catch {
      /* honest local defaults */
    }
  }, [entityId, entityType]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(next: BookingProfile) {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/booking/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(next),
      });
      if (res.ok) {
        const data = (await res.json()) as { profile: BookingProfile };
        setProfile(data.profile);
        setMsg("Booking profile saved.");
      } else {
        setMsg("Could not save booking profile.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  function toggleCategory(c: PerformanceType) {
    const categories = profile.categories.includes(c)
      ? profile.categories.filter((x) => x !== c)
      : [...profile.categories, c];
    setProfile({ ...profile, categories });
  }

  function toggleLooking(r: LookingForRole) {
    const lookingFor = profile.lookingFor.includes(r)
      ? profile.lookingFor.filter((x) => x !== r)
      : [...profile.lookingFor, r];
    setProfile({ ...profile, lookingFor });
  }

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Booking Profile</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>BOOK ME · rates · radius</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          One canonical profile. Discovery and map read the same data.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <Toggle
          label="BOOK ME enabled"
          active={profile.bookMeEnabled}
          onClick={() => setProfile({ ...profile, bookMeEnabled: !profile.bookMeEnabled })}
          color={accent}
        />
        <Toggle
          label="Available Tonight"
          active={profile.availableTonight}
          onClick={() => setProfile({ ...profile, availableTonight: !profile.availableTonight })}
          color="#FF2DAA"
        />
        <Toggle
          label="This Weekend"
          active={profile.availableThisWeekend}
          onClick={() =>
            setProfile({ ...profile, availableThisWeekend: !profile.availableThisWeekend })
          }
          color="#FFD700"
        />
        <Toggle
          label="Virtual OK"
          active={profile.virtualAvailable}
          onClick={() => setProfile({ ...profile, virtualAvailable: !profile.virtualAvailable })}
          color="#00FFFF"
        />
      </div>

      <div style={row}>
        <label style={field}>
          Public city
          <input
            value={profile.publicCity}
            onChange={(e) => setProfile({ ...profile, publicCity: e.target.value })}
            style={input}
            placeholder="City (public)"
          />
        </label>
        <label style={field}>
          Region
          <input
            value={profile.publicRegion}
            onChange={(e) => setProfile({ ...profile, publicRegion: e.target.value })}
            style={input}
            placeholder="State / region"
          />
        </label>
        <label style={field}>
          Travel radius (mi)
          <input
            type="number"
            min={0}
            value={profile.travelRadiusMiles}
            onChange={(e) =>
              setProfile({ ...profile, travelRadiusMiles: Number(e.target.value) || 0 })
            }
            style={input}
          />
        </label>
        <label style={field}>
          Rate min ($)
          <input
            type="number"
            min={0}
            value={profile.rateMinCents / 100}
            onChange={(e) =>
              setProfile({
                ...profile,
                rateMinCents: Math.round((Number(e.target.value) || 0) * 100),
              })
            }
            style={input}
          />
        </label>
        <label style={field}>
          Rate max / quote ($)
          <input
            type="number"
            min={0}
            value={profile.rateMaxCents / 100}
            onChange={(e) =>
              setProfile({
                ...profile,
                rateMaxCents: Math.round((Number(e.target.value) || 0) * 100),
              })
            }
            style={input}
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={label}>Performance types</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              style={chip(profile.categories.includes(c), accent)}
            >
              {c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={label}>Looking for collaborators</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {LOOKING.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleLooking(r)}
              style={chip(profile.lookingFor.includes(r), "#FF2DAA")}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <label style={{ ...field, marginTop: 12, display: "block" }}>
        Notes
        <textarea
          value={profile.notes}
          onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
          rows={2}
          style={{ ...input, width: "100%", resize: "vertical" }}
          placeholder="Travel needs, set length, technical riders…"
        />
      </label>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save(profile)}
          style={saveBtn(accent)}
        >
          {saving ? "Saving…" : "Save booking profile"}
        </button>
        {profile.bookMeEnabled && (
          <Link href={`/performers/${entityId}`} style={{ fontSize: 11, color: accent }}>
            BOOK ME will show on profile when enabled →
          </Link>
        )}
        {msg && <span style={{ fontSize: 12, color: accent }}>{msg}</span>}
      </div>

      <div style={{ marginTop: 18 }}>
        <BookingCanister
          entityId={entityId}
          entityType={entityType === "venue" ? "venue" : "performer"}
          accentColor={accent}
          showRequestForm={profile.bookMeEnabled}
        />
      </div>
    </section>
  );
}

function Toggle({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button type="button" onClick={onClick} style={chip(active, color)}>
      {label}
    </button>
  );
}

function section(accent: string): CSSProperties {
  return {
    background: "rgba(10,8,24,0.92)",
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: 18,
  };
}
function eyebrow(accent: string): CSSProperties {
  return {
    fontSize: 9,
    letterSpacing: "0.28em",
    color: accent,
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 4,
  };
}
const label: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 8,
  textTransform: "uppercase",
};
const row: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
};
const field: CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.5)" };
const input: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  padding: "8px 10px",
  fontSize: 12,
};
function chip(active: boolean, color: string): CSSProperties {
  return {
    borderRadius: 999,
    border: `1px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
    background: active ? `${color}22` : "rgba(255,255,255,0.04)",
    color: active ? color : "rgba(255,255,255,0.55)",
    padding: "6px 12px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    cursor: "pointer",
  };
}
function saveBtn(accent: string): CSSProperties {
  return {
    padding: "10px 16px",
    borderRadius: 10,
    border: `1px solid ${accent}66`,
    background: `${accent}22`,
    color: accent,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  };
}
