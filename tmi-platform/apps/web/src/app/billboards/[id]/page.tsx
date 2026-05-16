import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BillboardRotator from "@/components/billboard/BillboardRotator";
import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { BillboardShareCardEngine } from "@/lib/billboards/BillboardShareCardEngine";
import { getBillboardBySlug } from "@/lib/billboards/BillboardRegistry";
import BillboardSeoAuthorityEngine from "@/lib/seo/BillboardSeoAuthorityEngine";

type BillboardPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: BillboardPageProps): Promise<Metadata> {
  const { id } = await params;
  const seo = BillboardSeoAuthorityEngine.build(id);
  return seo?.metadata ?? { title: "Billboard not found | BernoutGlobal" };
}

export default async function BillboardPage({ params }: BillboardPageProps) {
  const { id } = await params;
  const billboard = getBillboardBySlug(id);
  const seo = BillboardSeoAuthorityEngine.build(id);
  if (!billboard || !seo) notFound();

  const share = BillboardShareCardEngine.build(id);
  const country = getCountry(billboard.country);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.structuredData) }} />
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <p style={{ color: "#00FFFF", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>Public Billboard</p>
        <h1 style={{ margin: "8px 0 6px", fontSize: 42 }}>{billboard.title}</h1>
        <p style={{ margin: 0, color: "#c9d9ff" }}>
          {billboard.artistSlug} · {country?.flag ?? ""} {country?.name ?? billboard.country} · {billboard.genre}
        </p>
        <p style={{ color: "#bfbfd4", marginTop: 10 }}>{billboard.seoDescription}</p>

        <div style={{ marginTop: 16, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 11, color: "#00FFFF", textTransform: "uppercase", letterSpacing: "0.14em" }}>Campaign</div>
            <div>{billboard.campaignType}</div>
          </div>
          <div style={{ border: "1px solid rgba(255,45,170,0.35)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 11, color: "#FF2DAA", textTransform: "uppercase", letterSpacing: "0.14em" }}>Promotion Date</div>
            <div>{billboard.startDate} to {billboard.endDate}</div>
          </div>
          <div style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 11, color: "#FFD700", textTransform: "uppercase", letterSpacing: "0.14em" }}>Sponsor</div>
            <div>{billboard.sponsorId ?? "Public partner"}</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <BillboardRotator billboardId={billboard.slug} />
        </div>

        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link href={`/artists/${billboard.artistSlug}`} style={{ color: "#00FFFF" }}>Artist profile</Link>
          <Link href={`/articles/artist/${billboard.linkedArticleSlug ?? billboard.artistSlug}`} style={{ color: "#FF2DAA" }}>Linked article</Link>
          <Link href={`/venues/${billboard.linkedVenueSlug ?? "neon-palace"}`} style={{ color: "#FFD700" }}>Linked venue/show</Link>
          <Link href={share?.shareLinks.x ?? "#"} style={{ color: "#8be9ff" }}>Share on X</Link>
          <Link href={share?.shareLinks.facebook ?? "#"} style={{ color: "#9dc4ff" }}>Share on Facebook</Link>
          <Link href={share?.shareLinks.whatsapp ?? "#"} style={{ color: "#9dffb2" }}>Share on WhatsApp</Link>
        </div>
      </div>
    </main>
  );
}
