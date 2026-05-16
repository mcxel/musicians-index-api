import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | TMI",
  description: "Manage your TMI account settings, billing, privacy, and notifications.",
};

const SECTIONS = [
  {
    label: "Profile",
    color: "#FF2DAA",
    icon: "🎤",
    links: [
      { label: "Edit Profile",        href: "/settings" },
      { label: "Change Username",     href: "/settings" },
      { label: "Update Avatar",       href: "/avatar"   },
      { label: "Social Links",        href: "/settings" },
    ],
  },
  {
    label: "Billing & Credits",
    color: "#00FF88",
    icon: "💳",
    links: [
      { label: "My Season Pass",       href: "/season-pass"   },
      { label: "Fan Credits Balance",  href: "/credits"       },
      { label: "Artist Wallet",        href: "/wallet"        },
      { label: "Transaction History",  href: "/wallet"        },
    ],
  },
  {
    label: "Content",
    color: "#00FFFF",
    icon: "🎵",
    links: [
      { label: "My Beats",             href: "/beats"                       },
      { label: "My Submissions",       href: "/submit"                      },
      { label: "Fan Club Settings",    href: "/fan-club"                    },
      { label: "Booking History",      href: "/artists/dashboard/bookings"  },
    ],
  },
  {
    label: "Privacy & Security",
    color: "#FFD700",
    icon: "🔒",
    links: [
      { label: "Change Password",     href: "/settings"        },
      { label: "Two-Factor Auth",     href: "/settings"        },
      { label: "Privacy Controls",    href: "/safety"          },
      { label: "Delete Account",      href: "/settings"        },
    ],
  },
  {
    label: "Notifications",
    color: "#AA2DFF",
    icon: "🔔",
    links: [
      { label: "Notification Preferences", href: "/notifications" },
      { label: "Email Settings",           href: "/settings"      },
      { label: "Push Notifications",       href: "/settings"      },
    ],
  },
  {
    label: "Help",
    color: "#FF9500",
    icon: "❓",
    links: [
      { label: "Support Center",   href: "/support"         },
      { label: "Safety Center",    href: "/safety"          },
      { label: "Tutorials",        href: "/tutorials"       },
      { label: "Contact Us",       href: "/support"         },
    ],
  },
];

export default function AccountPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>ACCOUNT</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>My Account</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          Manage everything in your TMI account.
        </p>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16 }}>
        {SECTIONS.map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}20`, borderRadius: 12, padding: "20px 18px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div style={{ fontSize: 10, fontWeight: 800, color: s.color, letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {s.links.map(l => (
                <Link key={l.label} href={l.href} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 7 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{l.label}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section style={{ textAlign: "center", marginTop: 40 }}>
        <Link href="/api/auth/logout" style={{ fontSize: 10, fontWeight: 700, color: "#FF5555", textDecoration: "none", border: "1px solid #FF555530", borderRadius: 6, padding: "9px 20px" }}>Sign Out</Link>
      </section>
    </main>
  );
}
