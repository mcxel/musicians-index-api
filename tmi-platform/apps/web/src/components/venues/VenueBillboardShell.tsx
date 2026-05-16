"use client";

type VenueBillboardShellProps = {
  countdownSeconds: number;
  sponsorAd: string;
  spotlightArtist: string;
};

export default function VenueBillboardShell({ countdownSeconds, sponsorAd, spotlightArtist }: VenueBillboardShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #4e6676", background: "#10202a", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#bfefff" }}>Venue Billboard Shell</h3>
      <div style={{ color: "#d3f2ff", fontSize: 12, lineHeight: 1.6 }}>
        <div>Show countdown: {countdownSeconds}s</div>
        <div>Sponsor ad: {sponsorAd}</div>
        <div>Spotlight: {spotlightArtist}</div>
      </div>
    </section>
  );
}
