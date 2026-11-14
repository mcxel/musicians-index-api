"use client";

import Link from "next/link";
import {
  getPublicAdStartFrom,
  getPublicPlatformAdMicroSpot,
  PUBLIC_TICKET_FEE_ACQUISITION,
} from "@/lib/commerce/publicPriceAcquisitionMessages";

const fee = PUBLIC_TICKET_FEE_ACQUISITION;
const ad = getPublicAdStartFrom();
const micro = getPublicPlatformAdMicroSpot();

const SPONSOR_ITEMS = [
  `SELL TICKETS — FEE FROM ${fee.minimumDisplay}`,
  `TICKET PLATFORM FEE UP TO ${fee.maximumDisplay}`,
  `ADVERTISE FROM ${ad.display}/DAY`,
  `PLATFORM ADS FROM ${micro.display}`,
  "SEE AD PRICES → /sponsors/advertise",
];

export default function SponsorTickerRail() {
  return (
    <section style={{ borderBottom: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffd700", whiteSpace: "nowrap" }}>
          Price Rail
        </strong>
        <div style={{ overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              gap: 18,
              animation: "tmiSponsorPriceTicker 40s linear infinite",
            }}
          >
            {[...SPONSOR_ITEMS, ...SPONSOR_ITEMS].map((item, i) => (
              <span key={`${item}-${i}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.86)" }}>
                {item}
                {"  *"}
              </span>
            ))}
          </div>
        </div>
        <Link href="/sponsors/advertise" style={{ color: "#ffffff", fontSize: 10, textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Advertise
        </Link>
      </div>
      <style>{`@keyframes tmiSponsorPriceTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}`}</style>
    </section>
  );
}
