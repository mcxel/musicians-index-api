import { type Metadata } from "next";

export const metadata: Metadata = { title: "Official Rules | Grand Platform Contest | TMI" };

const RULES = [
  { section: "1. Eligibility", body: "Any registered creator on The Musician's Index may enter. Open to: singers, rappers, comedians, dancers, DJs, bands, beatmakers, magicians, influencers, and freestyle artists. Must be 13+ years of age." },
  { section: "2. Season Dates", body: "The Grand Platform Contest opens for registration every year on August 8. Registration window: 60 days. Sponsor collection phase: 30 days. Regional rounds: 30 days. Semi-finals: 14 days. Grand Finals: 1 live platform event." },
  { section: "3. Qualification Requirement", body: "Each contestant must secure exactly 10 Local Sponsors and 10 Major Sponsors (20 total) before the sponsor collection phase deadline. Partial qualification does not advance to Regional Rounds." },
  { section: "4. Sponsor Rules", body: "Self-sponsorship is strictly prohibited. Each sponsor may only be counted once per entry. Sponsor payments must clear verification before being counted. Minimum: Local Bronze $50, Major Bronze $1,000." },
  { section: "5. Voting", body: "Fan voting opens during Regional Rounds. Each registered platform member receives one vote per round per entry. Major sponsors (Gold/Title tier) receive a 1.5x weighted vote. Tampering or bot voting leads to immediate disqualification." },
  { section: "6. Prizes", body: "Prizes are determined per season by the platform and title sponsor(s). Prize categories include cash awards, recording contracts, tour sponsorships, brand partnerships, and equipment packages." },
  { section: "7. Fair Play", body: "Any contestant found to be engaging in fraud, duplicate accounts, fake sponsors, vote manipulation, or abuse of the sponsor system will be permanently disqualified from the current and all future seasons." },
  { section: "8. Appeals", body: "Disqualified contestants may submit an appeal within 7 days via the admin appeal form. Appeals are reviewed by the contest operator and are final." },
  { section: "9. Archive", body: "All seasons are permanently archived. Winner profiles and sponsor recognition are preserved in the platform hall of fame." },
  { section: "10. Changes", body: "BerntoutGlobal XXL reserves the right to modify contest rules between seasons. Changes are announced at least 30 days before the registration window opens." },
];

export default function RulesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: "#ff6b1a", marginBottom: 16 }}>
          OFFICIAL CONTEST RULES
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 8px" }}>Grand Platform Contest</h1>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px", color: "#ffd700" }}>Official Rule Sections</h2>
        <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 48 }}>BerntoutGlobal XXL — The Musician&apos;s Index</p>
        {RULES.map((r) => (
          <div key={r.section} style={{ borderBottom: "1px solid rgba(255,255,255,.07)", paddingBottom: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#ffd700", margin: "0 0 10px" }}>{r.section}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,.65)", margin: 0 }}>{r.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
