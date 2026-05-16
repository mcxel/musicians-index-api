import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em" }}>Forgot Password</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Request a secure reset link. Links are single-use and time-limited.
        </p>
        <ForgotPasswordForm />
        <Link href="/auth" style={{ color: "#93c5fd", fontSize: 13 }}>
          ← Back to auth
        </Link>
      </div>
    </main>
  );
}
