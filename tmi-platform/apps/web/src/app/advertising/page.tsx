import Link from "next/link";
import {
  getAdvertisingEntryHeadline,
  listPublicAdvertisingOffersLowestFirst,
} from "@/lib/commerce/AdvertisingEntryPresentation";

export default function AdvertisingPage() {
  const entry = getAdvertisingEntryHeadline();
  const offers = listPublicAdvertisingOffersLowestFirst().slice(0, 12);

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href="/home/1" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
            ← Home
          </Link>
          <Link href="/home/4" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
            Marketplace
          </Link>
        </div>

        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", textTransform: "uppercase", margin: "0 0 10px" }}>
            Advertise on TMI
          </p>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Starting as low as {entry.display} a day
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 600, margin: "0 auto 20px" }}>
            Real catalog prices from TMI Stripe products. Premium Magazine placements keep their own truthful prices.
            Browse denser inventory in the Magazine ad marketplace.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href={entry.checkoutHref}
              style={{ padding: "12px 28px", background: "linear-gradient(135deg,#00FFFF,#AA2DFF)", borderRadius: 8, color: "#050510", fontWeight: 900, fontSize: 13, textDecoration: "none" }}
            >
              Activate {entry.display}/day entry
            </Link>
            <Link
              href="/magazine/advertise"
              style={{ padding: "12px 28px", background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 8, color: "#FF2DAA", fontWeight: 800, fontSize: 13, textDecoration: "none" }}
            >
              Magazine placements
            </Link>
            <Link
              href="/hub/advertiser"
              style={{ padding: "12px 28px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#e2e8f0", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
            >
              Advertiser Hub
            </Link>
            <Link
              href="/hub/sponsor"
              style={{ padding: "12px 28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
            >
              Sponsor Hub
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 40 }}>
          {offers.map((offer) => (
            <div
              key={offer.catalogId}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: offer.isEntryOffer ? "1px solid rgba(0,255,255,0.45)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: 20,
              }}
            >
              {offer.isEntryOffer ? (
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#00FFFF", marginBottom: 8 }}>
                  ENTRY OFFER
                </div>
              ) : (
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                  {offer.family}
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 10, minHeight: 36 }}>{offer.name}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: offer.isEntryOffer ? "#00FFFF" : "#FFD700", marginBottom: 14 }}>
                {offer.displayPrice}
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>{offer.intervalLabel}</span>
              </div>
              <Link
                href={offer.checkoutHref}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: 10,
                  borderRadius: 8,
                  background: offer.isEntryOffer ? "#00FFFF" : "rgba(255,215,0,0.12)",
                  color: offer.isEntryOffer ? "#050510" : "#FFD700",
                  border: offer.isEntryOffer ? "none" : "1px solid rgba(255,215,0,0.3)",
                  fontWeight: 800,
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                Get started →
              </Link>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#00E5FF", textTransform: "uppercase", marginBottom: 10 }}>
              For Advertisers
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
              Buy placements, upload creative, track campaigns from the Advertiser Hub and Magazine marketplace.
            </p>
            <Link href="/hub/advertiser" style={{ fontSize: 12, color: "#00E5FF", fontWeight: 800, textDecoration: "none" }}>
              Open Advertiser Hub →
            </Link>
          </div>
          <div style={{ background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 10 }}>
              For Sponsors
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
              Sponsor events, contests, and live shows. Same commerce authorities — presentation stays replaceable.
            </p>
            <Link href="/hub/sponsor" style={{ fontSize: 12, color: "#AA2DFF", fontWeight: 800, textDecoration: "none" }}>
              Open Sponsor Hub →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
