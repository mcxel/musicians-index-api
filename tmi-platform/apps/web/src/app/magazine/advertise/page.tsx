import Link from "next/link";
import MagazineAdMarketplaceTemporaryPresentation from "@/components/magazine/MagazineAdMarketplaceTemporaryPresentation";
import BusinessLivingMediaPortal from "@/components/commerce/BusinessLivingMediaPortal";
import { getAdvertisingEntryHeadline } from "@/lib/commerce/AdvertisingEntryPresentation";
import { MAGAZINE_AD_MARKETPLACE_CLASSIFICATION } from "@/lib/magazine/MagazineAdMarketplaceDataModel";

export default function MagazineAdvertisePage() {
  const entry = getAdvertisingEntryHeadline();

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 20px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <Link href="/advertising" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            ← Advertising
          </Link>
          <Link href="/hub/advertiser" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>
            Advertiser Hub
          </Link>
          <Link href="/hub/sponsor" style={{ fontSize: 11, color: "#AA2DFF", textDecoration: "none" }}>
            Sponsor Hub
          </Link>
          <Link href="/admin/sponsors" style={{ fontSize: 11, color: "#FFD700", textDecoration: "none" }}>
            Admin Sponsors
          </Link>
        </div>

        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FF2DAA", margin: "0 0 8px" }}>
          MAGAZINE AD MARKETPLACE
        </p>
        <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, margin: "0 0 10px" }}>
          Browse &amp; select placements
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 720, margin: "0 0 8px" }}>
          Starting as low as {entry.display} a day. Premium Magazine placements keep their own truthful prices.
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,215,0,0.7)", margin: "0 0 24px" }}>
          Status: {MAGAZINE_AD_MARKETPLACE_CLASSIFICATION} — not FINAL_VISUAL_COMPLETE / not PHYSICAL_GREEN
        </p>

        <div style={{ marginBottom: 28 }}>
          <BusinessLivingMediaPortal
            role="ADVERTISER"
            accent="#00FFFF"
            browseHref="/magazine/advertise"
            emptyHint="Select a placement below. Image and video creatives preview in this single Living Media Player."
          />
        </div>

        <MagazineAdMarketplaceTemporaryPresentation />
      </div>
    </main>
  );
}
