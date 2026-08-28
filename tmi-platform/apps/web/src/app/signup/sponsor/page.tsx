"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import BusinessPartnerSignupFields, {
  type BusinessPartnerSignupFormState,
} from "@/components/onboarding/BusinessPartnerSignupFields";
import {
  primaryBusinessHubRoute,
  rolesFromBusinessCapabilities,
  type BusinessPartnerCapability,
} from "@/lib/auth/BusinessPartnerCapabilities";
import {
  AGE_REQUIRED_ERROR,
  isSignupAgeEligible,
} from "@/components/onboarding/SignupPolicyAcceptance";

const DEFAULT_CAPS: BusinessPartnerCapability[] = [
  "SHOW_EVENT_SPONSOR",
  "ARTIST_SPONSOR",
  "PRODUCT_PRIZE_SPONSOR",
];

export default function SponsorSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessPartnerSignupFormState>({
    businessName: "",
    legalName: "",
    username: "",
    website: "",
    category: "",
    contactEmail: "",
    region: "",
    email: "",
    password: "",
    dateOfBirth: "",
    capabilities: DEFAULT_CAPS,
    followUps: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean }) => {
        if (active && d?.authenticated) router.replace("/hub/sponsor");
      })
      .catch(() => {});
    return () => { active = false; };
  }, [router]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    if (!form.businessName.trim() || !form.email.trim() || !form.password || !form.dateOfBirth) {
      setError("Business name, email, password, and date of birth are required.");
      setSubmitting(false);
      return;
    }
    if (!isSignupAgeEligible(form.dateOfBirth)) {
      setError(AGE_REQUIRED_ERROR);
      setSubmitting(false);
      return;
    }
    if (form.capabilities.length === 0) {
      setError("Select at least one capability.");
      setSubmitting(false);
      return;
    }

    try {
      const roles = rolesFromBusinessCapabilities(form.capabilities);
      const { csrfToken } = await fetch("/api/auth/csrf").then((r) => r.json());
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({
          name: form.businessName,
          email: form.email,
          password: form.password,
          dateOfBirth: form.dateOfBirth,
          dob: form.dateOfBirth,
          termsAccepted: true,
          originalityAccepted: true,
          role: roles[0],
          roles,
        }),
      });
      const regData = await regRes.json().catch(() => ({})) as {
        ok?: boolean; userId?: string; user?: { id?: string }; message?: string; error?: string;
      };
      if (!regRes.ok || regData.ok === false) {
        setError(regData.message ?? regData.error ?? "Signup failed.");
        setSubmitting(false);
        return;
      }

      const userId = regData.userId ?? regData.user?.id;
      if (userId) {
        await fetch("/api/auth/provision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, roles }),
        });
      }

      await fetch("/api/account/capabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessPartner: {
            businessName: form.businessName,
            legalName: form.legalName,
            username: form.username,
            website: form.website,
            category: form.category,
            contactEmail: form.contactEmail || form.email,
            region: form.region,
            capabilities: form.capabilities,
            followUps: form.followUps,
          },
        }),
      });

      router.replace(primaryBusinessHubRoute(form.capabilities));
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <OnboardingShell
      role="sponsor"
      form={(
        <BusinessPartnerSignupFields
          accentColor="#00FFFF"
          heading="Power Artist & Event Growth"
          subheading="One business account — sponsor shows, artists, prizes, and/or run ad placements."
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      )}
    />
  );
}
