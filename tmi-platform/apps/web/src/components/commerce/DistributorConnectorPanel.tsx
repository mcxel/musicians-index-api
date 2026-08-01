"use client";

/**
 * DistributorConnectorPanel — Creator Identity / Distributor + Streaming Links.
 * Phase 1: URL link + optional ISRC. Shopify stays in CommerceConnectorPanel.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  clearPerformerDistributorLink,
  HYBRID_DISTRIBUTOR_NOTE,
  listDistributorProviders,
  listLinkableDistributorProviders,
  listPerformerDistributorLinks,
  savePerformerDistributorLink,
  STREAM_VS_OWN_COPY,
  type DistributorProviderId,
  type PerformerDistributorLink,
} from "@/lib/commerce/DistributorConnectorRegistry";
import {
  getLivingCatalogForPerformer,
  saveLivingCatalogOverlay,
  type LivingCatalogTrack,
} from "@/lib/commerce/LivingCatalog";
import ListenOwnTrackCard from "@/components/commerce/ListenOwnTrackCard";

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 12,
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 4,
  display: "block",
};

export interface DistributorConnectorPanelProps {
  performerId: string;
  accentColor?: string;
}

export default function DistributorConnectorPanel({
  performerId,
  accentColor = "#00FFFF",
}: DistributorConnectorPanelProps) {
  const ac = accentColor;
  const providers = listDistributorProviders();
  const linkable = listLinkableDistributorProviders();

  const [links, setLinks] = useState<PerformerDistributorLink[]>([]);
  const [catalog, setCatalog] = useState<LivingCatalogTrack[]>([]);
  const [providerId, setProviderId] = useState<DistributorProviderId>("distrokid");
  const [profileUrl, setProfileUrl] = useState("");
  const [isrc, setIsrc] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [overlayTrackKey, setOverlayTrackKey] = useState("");
  const [overlayIsrc, setOverlayIsrc] = useState("");

  const refresh = useCallback(() => {
    setLinks(listPerformerDistributorLinks(performerId));
    const tracks = getLivingCatalogForPerformer(performerId);
    setCatalog(tracks);
    if (!overlayTrackKey && tracks[0]) {
      const key = tracks[0].id.includes(":")
        ? tracks[0].id.split(":").slice(1).join(":")
        : tracks[0].id;
      setOverlayTrackKey(key);
    }
  }, [performerId, overlayTrackKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSaveLink() {
    const url = profileUrl.trim();
    if (!url) {
      setStatusMsg("Profile / artist URL is required.");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setStatusMsg("URL must start with https://");
      return;
    }
    try {
      savePerformerDistributorLink({
        performerId,
        providerId,
        profileUrl: url,
        isrc: isrc.trim() || undefined,
      });
      setProfileUrl("");
      setIsrc("");
      setStatusMsg("Linked — URL only (no distributor API sync in Phase 1).");
      refresh();
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Could not save link.");
    }
  }

  function handleSaveTrackIsrc() {
    if (!overlayTrackKey) {
      setStatusMsg("No registry track to annotate yet.");
      return;
    }
    saveLivingCatalogOverlay(performerId, {
      trackKey: overlayTrackKey,
      isrc: overlayIsrc.trim() || undefined,
      distributor: providerId,
      tmiCommerceEnabled: true,
      battleEligible: false,
    });
    setStatusMsg("Track ISRC / distributor saved locally for this device.");
    refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${ac}33`,
          background: `${ac}0c`,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 6 }}>
          DISTRIBUTOR & STREAMING LINKS
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          {HYBRID_DISTRIBUTOR_NOTE} Distributors get you on Spotify/Apple; TMI is where fans Own & Support.
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>
          {STREAM_VS_OWN_COPY}
        </p>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac, marginBottom: 8 }}>
          CREATOR IDENTITY CONNECTORS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {providers.map((p) => {
            const linked = links.find((l) => l.providerId === p.id);
            const displayStatus = linked ? linked.status : p.status;
            return (
              <div
                key={p.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: linked ? `1px solid ${ac}55` : "1px solid rgba(255,255,255,0.1)",
                  background: linked ? `${ac}12` : "rgba(0,0,0,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{p.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {linked ? linked.profileUrl : p.capabilityNote}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      color:
                        displayStatus === "LINKED_URL"
                          ? "#00FF88"
                          : displayStatus === "CONNECTED"
                            ? ac
                            : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {displayStatus.replace("_", " ")}
                  </span>
                  {linked ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearPerformerDistributorLink(performerId, p.id);
                        refresh();
                        setStatusMsg(`${p.label} unlinked.`);
                      }}
                      style={{
                        fontSize: 9,
                        color: "rgba(255,100,100,0.8)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Unlink
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac }}>
          LINK PROFILE / ARTIST URL
        </div>
        <div>
          <label style={labelStyle}>PROVIDER</label>
          <select
            style={fieldStyle}
            value={providerId}
            onChange={(e) => setProviderId(e.target.value as DistributorProviderId)}
          >
            {linkable.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>PROFILE / ARTIST URL *</label>
          <input
            style={fieldStyle}
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder={
              linkable.find((p) => p.id === providerId)?.urlPlaceholder ?? "https://…"
            }
          />
        </div>
        <div>
          <label style={labelStyle}>OPTIONAL ISRC (paste)</label>
          <input
            style={fieldStyle}
            value={isrc}
            onChange={(e) => setIsrc(e.target.value)}
            placeholder="US-XXX-00-00000"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveLink}
          style={{
            alignSelf: "flex-start",
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${ac}`,
            background: `${ac}22`,
            color: ac,
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.08em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {links.some((l) => l.providerId === providerId) ? "UPDATE LINK" : "CONNECT LINK"}
        </button>
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
          Shopify storefronts live under Store & Commerce — not here. No DistroKid API sync yet.
        </p>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac, marginBottom: 8 }}>
          LIVING CATALOG · LISTEN VS OWN
        </div>
        {catalog.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.45, padding: "4px 0" }}>
            No tracks in PerformerRegistry yet. Upload via Media Locker / dashboard — catalog overlays attach
            here without a second upload pipeline.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {catalog.map((t, i) => (
              <ListenOwnTrackCard
                key={t.id}
                track={t}
                accentColor={ac}
                showMathNote={i === 0}
                compact
              />
            ))}
          </div>
        )}

        {catalog.length > 0 ? (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={labelStyle}>ANNOTATE TRACK ISRC (LOCAL OVERLAY)</label>
            <select
              style={fieldStyle}
              value={overlayTrackKey}
              onChange={(e) => setOverlayTrackKey(e.target.value)}
            >
              {catalog.map((t) => {
                const key = t.id.includes(":") ? t.id.split(":").slice(1).join(":") : t.id;
                return (
                  <option key={t.id} value={key}>
                    {t.title}
                  </option>
                );
              })}
            </select>
            <input
              style={fieldStyle}
              value={overlayIsrc}
              onChange={(e) => setOverlayIsrc(e.target.value)}
              placeholder="ISRC for selected track"
            />
            <button
              type="button"
              onClick={handleSaveTrackIsrc}
              style={{
                alignSelf: "flex-start",
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${ac}88`,
                background: "transparent",
                color: ac,
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: "0.08em",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              SAVE TRACK OVERLAY
            </button>
          </div>
        ) : null}
      </div>

      {statusMsg ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{statusMsg}</div>
      ) : null}
    </div>
  );
}
