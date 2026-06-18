import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "TMI Refund Policy — subscription cancellations, digital product refunds, tip reversals, and booking fee policies for The Musician's Index.",
  alternates: { canonical: "https://themusiciansindex.com/refund-policy" },
};

const SECTIONS = [
  {
    title: "1. Subscription Refunds",
    body: "Monthly subscription refunds are available within 7 days of your initial purchase or renewal date. To request a refund, contact support@themusiciansindex.com with your account email and transaction ID. Refunds are issued to the original payment method and may take 5-10 business days to appear. We do not issue prorated refunds for cancellations mid-cycle beyond the 7-day window.",
  },
  {
    title: "2. Annual Plan Refunds",
    body: "Annual subscriptions may be refunded in full within 14 days of purchase. After 14 days, annual plans may be refunded on a prorated basis for the remaining unused months, at TMI's discretion. To request a prorated refund on an annual plan, contact billing@themusiciansindex.com.",
  },
  {
    title: "3. Digital Product Refunds",
    body: "Digital purchases including beats, sample packs, instrumentals, and exclusive downloads are eligible for refund within 48 hours of purchase, provided the digital file has not been downloaded. Once a digital product has been downloaded, it is considered consumed and is non-refundable. Exceptions are made only for verified delivery failures.",
  },
  {
    title: "4. Tip & Fan Payment Refunds",
    body: "Tips sent directly to performers are non-refundable. Tips represent voluntary support from fans to creators and are processed immediately. Fan club subscription payments may be refunded within 48 hours of the initial charge. Recurring fan club payments are non-refundable after the billing date.",
  },
  {
    title: "5. Event & Ticket Refunds",
    body: "Tickets to live events hosted through TMI are refundable up to 24 hours before the event start time. Refunds for cancelled events are issued automatically within 3-5 business days. No-shows and last-minute cancellations within 24 hours of the event are non-refundable except in cases of documented emergency.",
  },
  {
    title: "6. Booking Fee Refunds",
    body: "Booking fees for performer or venue engagements arranged through TMI are refundable if cancelled more than 72 hours before the scheduled booking. Cancellations within 72 hours forfeit 50% of the booking fee. Same-day cancellations are non-refundable. All booking disputes are handled on a case-by-case basis.",
  },
  {
    title: "7. Advertising Campaign Refunds",
    body: "Advertising campaigns that have not yet launched may be cancelled for a full refund within 48 hours of payment. Once a campaign has begun running impressions, no refunds are issued for the days already served. Campaigns paused due to advertiser-side policy violations are not eligible for refund.",
  },
  {
    title: "8. NFT & Collectible Refunds",
    body: "NFTs minted or purchased through TMI are non-refundable once the transaction is confirmed on the blockchain. Digital collectibles are similarly non-refundable after delivery. If you experienced a technical error during minting that resulted in a charge without delivery, contact support@themusiciansindex.com immediately.",
  },
  {
    title: "9. How to Request a Refund",
    body: "Email billing@themusiciansindex.com with: (1) your registered email address, (2) the transaction ID from your receipt, (3) the product or subscription being refunded, and (4) a brief reason. We respond to all refund requests within 2 business days. Approved refunds are processed within 5-10 business days through Stripe.",
  },
  {
    title: "10. Disputes",
    body: "If you believe you were charged incorrectly or your refund was unfairly denied, you may file a dispute by emailing legal@themusiciansindex.com. We will review and respond within 5 business days. We strongly encourage resolving disputes through our support team before initiating a chargeback with your bank, as chargebacks may result in account suspension.",
  },
];

export default function RefundPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", marginBottom: 8 }}>LEGAL</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Refund Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Last updated: June 2026 · BernoutGlobal LLC</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#FFD700", margin: "0 0 8px" }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "20px 24px", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
            To request a refund, email{" "}
            <a href="mailto:billing@themusiciansindex.com" style={{ color: "#FFD700", textDecoration: "none" }}>billing@themusiciansindex.com</a>{" "}
            or visit our{" "}
            <Link href="/support" style={{ color: "#FFD700", textDecoration: "none", fontWeight: 600 }}>Support Center</Link>.
          </p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/creator-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Creator Policy</Link>
          <Link href="/advertiser-policy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Advertiser Policy</Link>
        </div>
      </div>
    </main>
  );
}
