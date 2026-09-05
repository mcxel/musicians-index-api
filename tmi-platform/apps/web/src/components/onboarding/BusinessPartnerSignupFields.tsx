"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BUSINESS_PARTNER_CAPABILITY_LABELS,
  type BusinessPartnerCapability,
} from "@/lib/auth/BusinessPartnerCapabilities";
import SignupPolicyAcceptance, {
  AGE_REQUIRED_ERROR,
  POLICY_ACCEPTANCE_ERROR,
  allRequiredPoliciesAccepted,
  emptyPolicyChecks,
  isSignupAgeEligible,
} from "@/components/onboarding/SignupPolicyAcceptance";
import type { PolicyId } from "@/lib/messaging/policyCatalog";

export type BusinessPartnerSignupFormState = {
  businessName: string;
  legalName: string;
  username: string;
  website: string;
  category: string;
  contactEmail: string;
  region: string;
  email: string;
  password: string;
  dateOfBirth: string;
  capabilities: BusinessPartnerCapability[];
  followUps: Partial<Record<BusinessPartnerCapability, Record<string, string>>>;
};

type Props = {
  accentColor: string;
  heading: string;
  subheading: string;
  form: BusinessPartnerSignupFormState;
  onChange: (next: BusinessPartnerSignupFormState) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
  backHref?: string;
};

const CAPABILITY_ORDER: BusinessPartnerCapability[] = [
  "ADVERTISER",
  "SHOW_EVENT_SPONSOR",
  "ARTIST_SPONSOR",
  "PRODUCT_PRIZE_SPONSOR",
];

const FOLLOW_UP_FIELDS: Partial<
  Record<BusinessPartnerCapability, Array<{ key: string; label: string; placeholder: string }>>
> = {
  ADVERTISER: [
    { key: "monthlyAdBudget", label: "Monthly ad budget (USD)", placeholder: "5000" },
    { key: "primaryPlacement", label: "Primary placement goal", placeholder: "Magazine, live overlay…" },
  ],
  SHOW_EVENT_SPONSOR: [
    { key: "flagshipInterest", label: "Flagship shows of interest", placeholder: "Monday Night Stage, battles…" },
    { key: "prizeBudgetRange", label: "Prize / placement budget range", placeholder: "Describe range — legal review required" },
  ],
  ARTIST_SPONSOR: [
    { key: "artistCategories", label: "Artist categories to sponsor", placeholder: "Hip-Hop, R&B, comedy…" },
    { key: "overlayPreference", label: "Overlay / canister preference", placeholder: "Live lower-third, profile canister…" },
  ],
  PRODUCT_PRIZE_SPONSOR: [
    { key: "productCategory", label: "Product / prize category", placeholder: "Headphones, gift cards, merch…" },
    { key: "distributionModel", label: "Distribution model", placeholder: "Contest winners, random draw…" },
  ],
};

export default function BusinessPartnerSignupFields({
  accentColor,
  form,
  onChange,
  onSubmit,
  submitting,
  error,
  heading,
  subheading,
  backHref = "/signup",
}: Props) {
  const [policyChecks, setPolicyChecks] = useState<Record<PolicyId, boolean>>(emptyPolicyChecks());
  const [localError, setLocalError] = useState("");

  function toggleCapability(cap: BusinessPartnerCapability) {
    const next = form.capabilities.includes(cap)
      ? form.capabilities.filter((c) => c !== cap)
      : [...form.capabilities, cap];
    onChange({ ...form, capabilities: next });
  }

  function setFollowUp(cap: BusinessPartnerCapability, key: string, value: string) {
    onChange({
      ...form,
      followUps: {
        ...form.followUps,
        [cap]: { ...(form.followUps[cap] ?? {}), [key]: value },
      },
    });
  }

  function handleSubmitClick() {
    setLocalError("");
    if (!form.dateOfBirth.trim()) {
      setLocalError("Date of birth is required.");
      return;
    }
    if (!isSignupAgeEligible(form.dateOfBirth)) {
      setLocalError(AGE_REQUIRED_ERROR);
      return;
    }
    if (!allRequiredPoliciesAccepted(policyChecks)) {
      setLocalError(POLICY_ACCEPTANCE_ERROR);
      return;
    }
    onSubmit();
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    fontWeight: 800,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    padding: "10px 12px",
    fontSize: 14,
  };

  const displayError = localError || error;
  const canSubmit =
    Boolean(form.businessName.trim() && form.email.trim() && form.password && form.dateOfBirth) &&
    allRequiredPoliciesAccepted(policyChecks) &&
    form.capabilities.length > 0;

  return (
    <>
      <header style={{ display: "grid", gap: 8 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: accentColor, fontWeight: 900 }}>
          Business Partner Account
        </p>
        <h1 style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: "#fff", margin: 0 }}>{heading}</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0 }}>{subheading}</p>
      </header>

      <div style={{ display: "grid", gap: 10 }}>
        {[
          ["Business Name *", "businessName", "text", "Acme Audio Co."],
          ["Legal Entity Name (Optional)", "legalName", "text", "Acme Audio LLC"],
          ["Public Username (Optional)", "username", "text", "acme-audio"],
          ["Website (Optional)", "website", "url", "https://example.com"],
          ["Industry Category (Optional)", "category", "text", "Audio gear, apparel, beverage…"],
          ["Work Email *", "email", "email", "partnerships@brand.com"],
          ["Contact Phone / Region (Optional)", "region", "text", "North America · +1…"],
          ["Password *", "password", "password", "8+ characters"],
        ].map(([label, key, type, placeholder]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input
              style={inputStyle}
              type={type}
              value={String((form as unknown as Record<string, string>)[key] ?? "")}
              onChange={(e) => onChange({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
            />
          </div>
        ))}
        <div>
          <label style={labelStyle}>Date of Birth *</label>
          <input
            style={inputStyle}
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => onChange({ ...form, dateOfBirth: e.target.value })}
          />
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            Required — you must be 16+ to join TMI.
          </p>
        </div>
        <SignupPolicyAcceptance
          checks={policyChecks}
          onChange={setPolicyChecks}
          accent={accentColor}
        />
      </div>

      <div style={{ borderRadius: 12, border: `1px solid ${accentColor}33`, padding: "12px 14px" }}>
        <p style={{ ...labelStyle, marginBottom: 10 }}>What are you here to do? (select all)</p>
        <div style={{ display: "grid", gap: 8 }}>
          {CAPABILITY_ORDER.map((cap) => {
            const active = form.capabilities.includes(cap);
            return (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCapability(cap)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1px solid ${active ? accentColor : "rgba(255,255,255,0.12)"}`,
                  background: active ? `${accentColor}18` : "rgba(255,255,255,0.02)",
                  color: active ? accentColor : "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {active ? "✓ " : ""}{BUSINESS_PARTNER_CAPABILITY_LABELS[cap]}
              </button>
            );
          })}
        </div>
      </div>

      {form.capabilities.map((cap) => {
        const fields = FOLLOW_UP_FIELDS[cap];
        if (!fields?.length) return null;
        return (
          <div key={cap} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px" }}>
            <p style={{ ...labelStyle, color: accentColor, marginBottom: 8 }}>{BUSINESS_PARTNER_CAPABILITY_LABELS[cap]} — details</p>
            <div style={{ display: "grid", gap: 8 }}>
              {fields.map((field) => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    style={inputStyle}
                    value={form.followUps[cap]?.[field.key] ?? ""}
                    onChange={(e) => setFollowUp(cap, field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        style={{
          borderRadius: 10,
          border: `1px solid ${accentColor}88`,
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}AA)`,
          color: "#050510",
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "12px 14px",
          cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
          opacity: submitting || !canSubmit ? 0.5 : 1,
        }}
        onClick={handleSubmitClick}
        disabled={submitting || !canSubmit}
      >
        {submitting ? "Creating Account…" : "Create Business Partner Account →"}
      </button>

      {displayError && <p style={{ fontSize: 11, color: "#FF4444", margin: 0 }}>{displayError}</p>}

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
        Need another role?{" "}
        <Link href={backHref} style={{ color: accentColor }}>
          Back to role selector
        </Link>
      </div>
    </>
  );
}
