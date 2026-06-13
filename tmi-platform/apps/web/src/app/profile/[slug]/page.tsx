import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function getMemberById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userProfile:   { select: { avatarUrl: true, bio: true } },
        artistProfile: { select: { genres: true, stageName: true } },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getMemberById(params.slug);
  const name = user?.displayName ?? user?.name ?? titleCase(params.slug);
  return {
    title: `${name} | TMI`,
    description: `${name} on The Musician's Index`,
  };
}

export default async function GenericProfilePage({ params }: Props) {
  const user = await getMemberById(params.slug);

  if (user) {
    const displayName = user.artistProfile?.stageName ?? user.displayName ?? user.name ?? user.email?.split("@")[0] ?? "Member";
    const avatarUrl   = user.userProfile?.avatarUrl ?? null;
    const bio         = user.userProfile?.bio ?? null;
    const genre       = user.artistProfile?.genres?.[0] ?? null;
    const tier        = user.tier ?? "free";
    const joinedStr   = user.userCreatedAt
      ? new Date(user.userCreatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : null;

    return (
      <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
        <div style={{ padding: "20px 24px 0", display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
          <Link href="/leaderboard" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>LEADERBOARD</Link>
        </div>

        {/* Hero */}
        <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{
              width: 96, height: 96, borderRadius: "50%", flexShrink: 0,
              border: `3px solid ${tier === "diamond" ? "#FFD700" : "rgba(0,255,255,0.4)"}`,
              boxShadow: `0 0 24px ${tier === "diamond" ? "rgba(255,215,0,0.3)" : "rgba(0,255,255,0.12)"}`,
              overflow: "hidden", background: "rgba(0,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#00FFFF" }}>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px", letterSpacing: "0.02em" }}>{displayName}</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                {genre && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 12, padding: "2px 10px" }}>
                    {genre}
                  </span>
                )}
                {tier !== "free" && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "2px 10px" }}>
                    {tier.toUpperCase()}
                  </span>
                )}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>TMI Member</span>
              </div>
              {joinedStr && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Joined {joinedStr}</div>
              )}
            </div>
          </div>

          {bio && (
            <div style={{ maxWidth: 700, margin: "16px auto 0", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              {bio}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/vote/${user.id}`} style={{ padding: "10px 20px", borderRadius: 8, background: "#AA2DFF", color: "#fff", fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.08em" }}>
            VOTE ↑
          </Link>
          <Link href="/home/1" style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", color: "#00FFFF", fontWeight: 800, fontSize: 11, textDecoration: "none" }}>
            🌀 See Orbit
          </Link>
          <Link href="/leaderboard" style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>
            Leaderboard
          </Link>
        </div>

        {/* Photo upload CTA if no avatar */}
        {!avatarUrl && (
          <div style={{ maxWidth: 700, margin: "0 auto 20px", padding: "0 24px" }}>
            <div style={{ padding: "14px 16px", background: "rgba(170,45,255,0.05)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#AA2DFF", marginBottom: 4 }}>📷 No photo yet</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Upload your photo to appear with your face on the orbit wheel.</div>
              </div>
              <Link href="/settings/avatar" style={{ padding: "8px 16px", borderRadius: 8, background: "#AA2DFF", color: "#fff", fontWeight: 900, fontSize: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
                UPLOAD →
              </Link>
            </div>
          </div>
        )}

        {/* Role-specific profile links */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", fontWeight: 700, marginBottom: 12 }}>ROLE PROFILES</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { href: `/profile/artist/${params.slug}`,    label: "Artist",    color: "#00FFFF" },
              { href: `/profile/fan/${params.slug}`,        label: "Fan",        color: "#FF2DAA" },
              { href: `/profile/performer/${params.slug}`,  label: "Performer",  color: "#AA2DFF" },
              { href: `/profile/sponsor/${params.slug}`,    label: "Sponsor",    color: "#FFD700" },
              { href: `/profile/venue/${params.slug}`,      label: "Venue",      color: "#22c55e" },
              { href: `/profile/advertiser/${params.slug}`, label: "Advertiser", color: "#FFA500" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px", borderRadius: 16, fontSize: 10, fontWeight: 700,
                  background: `${link.color}08`, border: `1px solid ${link.color}25`,
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

  // ── Fallback: slug is not a user ID ──────────────────────────────────────────
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
            { href: `/profile/artist/${params.slug}`,    label: "Artist Profile",    color: "#00FFFF" },
            { href: `/profile/fan/${params.slug}`,        label: "Fan Profile",        color: "#FF2DAA" },
            { href: `/profile/performer/${params.slug}`,  label: "Performer Profile",  color: "#AA2DFF" },
            { href: `/profile/sponsor/${params.slug}`,    label: "Sponsor Profile",    color: "#FFD700" },
            { href: `/profile/venue/${params.slug}`,      label: "Venue Profile",      color: "#22c55e" },
            { href: `/profile/advertiser/${params.slug}`, label: "Advertiser Profile", color: "#FFA500" },
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
