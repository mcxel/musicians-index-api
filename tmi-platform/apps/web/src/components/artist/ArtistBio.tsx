interface ArtistBioProps {
  bio: string | null;
}

export default function ArtistBio({ bio }: ArtistBioProps) {
  if (!bio) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      padding: "20px 24px",
      marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
        ABOUT
      </div>
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.8,
        color: "rgba(255,255,255,0.7)",
      }}>
        {bio}
      </p>
    </div>
  );
}
