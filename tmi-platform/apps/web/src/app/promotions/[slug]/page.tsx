import type { Metadata } from "next";
import { PromotionSeoEngine } from "@/lib/seo/PromotionSeoEngine";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return PromotionSeoEngine.build(slug).metadata;
}

export default async function PromotionPage({ params }: Props) {
  const { slug } = await params;
  const seo = PromotionSeoEngine.build(slug);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "white", padding: "30px 16px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.structuredData) }} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ color: "#FFD700", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Promotion Discovery</p>
        <h1 style={{ fontSize: 42, margin: "10px 0" }}>{slug.replace(/-/g, " ")}</h1>
        <p style={{ color: "#c2c2d6", maxWidth: 680 }}>{seo.metadata.description as string}</p>
      </div>
    </main>
  );
}
