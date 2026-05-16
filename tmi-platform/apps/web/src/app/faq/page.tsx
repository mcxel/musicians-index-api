import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | TMI",
  description: "Frequently asked questions about The Musician's Index — subscriptions, battles, beats, NFTs, and more.",
};

const FAQS = [
  {
    category: "PLATFORM",
    color: "#00FFFF",
    items: [
      { q: "What is TMI?", a: "The Musician's Index (TMI) is a live music performance and competition platform. Artists perform live, battle each other, sell beats, mint NFTs, and earn from their audience." },
      { q: "How do I get started?", a: "Sign up at /signup, choose your role (Fan, Artist, Performer, Producer, Writer, or Venue), and complete onboarding. You'll earn XP immediately." },
      { q: "Is TMI free to join?", a: "Yes — the base platform is free. Premium passes (Fan Pass, Artist Pro, VIP) unlock additional features and rewards." },
    ],
  },
  {
    category: "SUBSCRIPTIONS",
    color: "#FF2DAA",
    items: [
      { q: "What is included in Member Pro?", a: "Member Pro ($9.99/mo) includes all live rooms, priority chat, HD streams, monthly bonus XP, and no ads." },
      { q: "Can I cancel my subscription?", a: "Yes. All subscriptions are month-to-month and can be cancelled any time from your account settings. No cancellation fees." },
      { q: "What is the Season Pass?", a: "The Season Pass ($49.99, one-time) grants access to all season events, exclusive merch drops, VIP room access, and season champion eligibility." },
    ],
  },
  {
    category: "BATTLES & CONTESTS",
    color: "#FFD700",
    items: [
      { q: "How do battles work?", a: "Two artists battle head-to-head in live 18-minute rounds. The crowd votes. The winner earns points, XP, and prize eligibility." },
      { q: "What is Song-for-Song?", a: "Song-for-Song is a battle format where artists alternate playing songs. The crowd votes Fire, Smooth, or Miss after each. Best of 5 wins." },
      { q: "How do I enter a contest?", a: "Go to /contests to see active contests. Entry requirements vary — some require Artist Pro, others are open to all verified artists." },
    ],
  },
  {
    category: "BEATS & NFTs",
    color: "#AA2DFF",
    items: [
      { q: "How do beat sales work?", a: "Producers upload beats to the Beat Lab. Artists license them (Basic, Premium, or Exclusive). Producers earn 90% of each sale." },
      { q: "What are TMI NFTs?", a: "NFTs on TMI include artist cards, battle proofs, fan packs, event tickets, and seasonal collectibles. All minted in the NFT Lab." },
      { q: "How do royalties work?", a: "When your NFT is resold, you earn a royalty (minimum 5%). TMI enforces royalties at the contract level — automatic, forever." },
    ],
  },
];

export default function FaqPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>HELP CENTER</div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 8 }}>FAQ</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>Common questions answered. Still need help? <Link href="/support" style={{ color: "#00FFFF" }}>Contact support →</Link></p>

        <div style={{ display: "grid", gap: 32 }}>
          {FAQS.map(section => (
            <div key={section.category}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: section.color, fontWeight: 800, marginBottom: 16 }}>{section.category}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {section.items.map((faq, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${section.color}18`, borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: "#fff" }}>{faq.q}</div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/support" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Contact Support</Link>
          <Link href="/about" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>About TMI</Link>
          <Link href="/subscriptions" style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: "9px 16px" }}>View Plans</Link>
        </div>
      </div>
    </main>
  );
}
