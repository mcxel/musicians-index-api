import Link from "next/link";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function GenericProfilePage({ params }: Props) {
  const displayName = titleCase(params.slug);

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "20px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>

      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
            background: "rgba(0,255,255,0.12)", border: "2px solid rgba(0,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 900, color: "#00FFFF",
          }}>
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>{displayName}</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>TMI Member</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "24px auto", padding: "0 24px" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
          Looking for a specific profile? Use one of the role-specific profile pages:
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { href: `/profile/artist/${params.slug}`,     label: "Artist Profile",     color: "#00FFFF" },
            { href: `/profile/fan/${params.slug}`,         label: "Fan Profile",         color: "#FF2DAA" },
            { href: `/profile/performer/${params.slug}`,   label: "Performer Profile",   color: "#AA2DFF" },
            { href: `/profile/sponsor/${params.slug}`,     label: "Sponsor Profile",     color: "#FFD700" },
            { href: `/profile/venue/${params.slug}`,       label: "Venue Profile",       color: "#22c55e" },
            { href: `/profile/advertiser/${params.slug}`,  label: "Advertiser Profile",  color: "#FFA500" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: `${link.color}10`, border: `1px solid ${link.color}30`,
                color: link.color, textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
