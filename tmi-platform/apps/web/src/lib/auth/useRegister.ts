"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type RegisterPayload = {
  email: string;
  password: string;
  dateOfBirth: string;
  termsAccepted: boolean;
  originalityAccepted: boolean;
  parentEmail?: string;
};

export function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: RegisterPayload, redirectTo: string) {
    setLoading(true);
    setError(null);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = (await sessionRes.json()) as { csrfToken?: string };
      const csrfToken = sessionData.csrfToken ?? "";

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `Registration failed (${res.status})`);
      }

      // Auto-login after successful registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      });

      if (!loginRes.ok) {
        router.push(`/login?email=${encodeURIComponent(payload.email)}&registered=1`);
        return;
      }

      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, submit };
}
