import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing Support | TMI",
  description:
    "Get help with billing, subscriptions, refunds, and payment issues on The Musician's Index.",
};

const BILLING_FAQS = [
  {
    q: "How do I cancel my subscription?",
    a: "Go to Account → Billing → Cancel Subscription. Your access continues until the end of the current billing period.",
  },
  {
    q: "How do I get a refund?",
    a: "Refunds are available within 7 days of purchase for subscriptions, and 48 hours for digital products. Submit a support ticket with your transaction ID.",
  },
  {
    q: "How do artist payouts work?",
    a: "Payouts are processed every Monday via Stripe Connect for earnings over $25. Go to Wallet → Payout Settings to configure your bank account.",
  },
  {
    q: "I was charged twice. What do I do?",
    a: "This usually happens when two checkout sessions complete in the same window. Submit a billing ticket with both transaction IDs and we'll process a refund for the duplicate.",
  },
  {
    q: "My card was declined. How do I retry?",
    a: "Go to Account → Billing → Update Payment Method. Once a new card is added, your subscription resumes automatically.",
  },
  {
    q: "Why is my account still showing the old tier?",
    a: "After a successful payment, tier upgrades apply within 5 minutes. If yours is still pending after 15 minutes, submit a billing ticket with your Stripe session ID.",
  },
];

export default function BillingSupportPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 28,
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <Link
            href="/support"
            style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          >
            Support
          </Link>
          <span>›</span>
          <span style={{ color: "#00FF88" }}>Billing</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "#00FF88",
              letterSpacing: "0.35em",
              marginBottom: 8,
            }}
          >
            BILLING & PAYMENTS
          </div>
          <h1
            style={{
              fontSize: "clamp(22px,4vw,36px)",
              fontWeight: 900,
              margin: "0 0 10px",
            }}
          >
            Billing Support
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 500,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Subscription management, refunds, payouts, and payment issues.
          </p>
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          {[
            { href: "/account", label: "Manage Subscription", color: "#00FF88" },
            { href: "/support/contact?category=billing", label: "Submit Billing Ticket", color: "#00FFFF" },
            { href: "/support/account-recovery", label: "Account Access Issues", color: "#AA2DFF" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "9px 16px",
                border: `1px solid ${l.color}35`,
                borderRadius: 8,
                color: l.color,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                background: l.color + "08",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.2em",
              marginBottom: 18,
            }}
          >
            FREQUENTLY ASKED
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BILLING_FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(0,255,136,0.03)",
                  border: "1px solid rgba(0,255,136,0.1)",
                  borderRadius: 10,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  {faq.q}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div
          style={{
            marginTop: 36,
            padding: "22px 20px",
            background: "rgba(0,255,136,0.04)",
            border: "1px solid rgba(0,255,136,0.18)",
            borderRadius: 12,
          }}
        >
          <div
            style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}
          >
            Didn&apos;t find your answer?
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 14,
            }}
          >
            Submit a billing ticket and our team will respond within 24–48
            hours.
          </div>
          <Link
            href="/support/contact?category=billing"
            style={{
              display: "inline-block",
              padding: "10px 22px",
              borderRadius: 8,
              background: "#00FF88",
              color: "#050510",
              fontWeight: 800,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Contact Billing Support →
          </Link>
        </div>
      </div>
    </main>
  );
}
