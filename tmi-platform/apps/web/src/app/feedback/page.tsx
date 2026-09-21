import type { Metadata } from "next";
import FeedbackIntakeSurface from "@/app/feedback/FeedbackIntakeSurface";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";

export const metadata: Metadata = {
  title: "Beta Feedback · The Musician's Index",
  description: "Official Beta Feedback and diagnostics portal for The Musician's Index platform.",
  alternates: {
    canonical: "https://themusiciansindex.com/feedback",
  },
};

export default function FeedbackPage() {
  return (
    <div style={{ background: "#050510", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <GlobalTmiHeader />
      <main style={{ padding: "40px 0 80px" }}>
        <FeedbackIntakeSurface />
      </main>
    </div>
  );
}
