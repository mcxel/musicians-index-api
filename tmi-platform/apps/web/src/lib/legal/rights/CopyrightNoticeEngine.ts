/**
 * CopyrightNoticeEngine — platform notices for UI / intake.
 * Explicitly rejects "No Copyright Intended" as a license claim.
 */

const FORBIDDEN = /no\s*copyright\s*intended/i;

export type CopyrightNotice = {
  id: string;
  title: string;
  body: string;
};

export function listCopyrightNotices(): CopyrightNotice[] {
  return [
    {
      id: "CN-RECORDING-SPLIT",
      title: "Experience mix ≠ Creator recording mix",
      body:
        "When a user is recording or broadcasting with background music and freestyle is not active, " +
        "TMI may keep the normal experience mix in headphones while substituting creator-safe audio " +
        "or silence in the recording mix based on rights state.",
    },
    {
      id: "CN-NO-NCI",
      title: "No Copyright Intended is not a license",
      body:
        '"No Copyright Intended" does not create a license and is never accepted as rights protection on TMI.',
    },
    {
      id: "CN-UNKNOWN-YELLOW",
      title: "Unknown rights default to Yellow",
      body:
        "Assets without rights evidence default to TMI PLAYBACK ONLY / Creator Safe Mode. " +
        "Green (Recording Safe) requires evidence — never assumed.",
    },
  ];
}

export function rejectForbiddenLicenseClaim(text: string): {
  ok: boolean;
  error?: string;
} {
  if (FORBIDDEN.test(text)) {
    return {
      ok: false,
      error:
        '"No Copyright Intended" does not create a license and cannot be used as rights protection.',
    };
  }
  return { ok: true };
}
