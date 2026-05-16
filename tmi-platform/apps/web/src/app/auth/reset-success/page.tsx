import Link from "next/link";
import RecoveryStatusCard from "@/components/auth/RecoveryStatusCard";

export default function ResetSuccessPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em" }}>Password Reset Complete</h1>
        <RecoveryStatusCard
          title="Security Update"
          status="success"
          message="Your password has been updated and prior sessions should be re-authenticated."
        />
        <Link href="/auth" style={{ color: "#93c5fd", fontSize: 13 }}>
          Continue to sign in
        </Link>
      </div>
    </main>
  );
}
