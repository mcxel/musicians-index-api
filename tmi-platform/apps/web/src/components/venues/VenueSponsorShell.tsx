"use client";

type VenueSponsorShellProps = {
  sponsorAd: string;
  onRotateAd: () => void;
};

export default function VenueSponsorShell({ sponsorAd, onRotateAd }: VenueSponsorShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #5a6f49", background: "#1a2412", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#d8f7be" }}>Venue Sponsor Shell</h3>
      <p style={{ color: "#def7ca", fontSize: 12 }}>Current sponsor ad: {sponsorAd}</p>
      <button onClick={onRotateAd} style={{ marginTop: 8, borderRadius: 8, border: "1px solid #9fc27e", background: "#3a5823", color: "#def6c8", padding: "6px 10px", cursor: "pointer" }}>
        Rotate Sponsor Ad
      </button>
    </section>
  );
}
