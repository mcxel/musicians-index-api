/**
 * Canonical profile identity field labels.
 * Single source of truth for role-specific label, placeholder, helper text,
 * and validation copy across all onboarding and profile surfaces.
 *
 * Rule: a venue must never see "Artist Name". An advertiser must not get
 * performer-specific language. Import getProfileFieldLabels() and pass the
 * current account role — do not add scattered role conditionals in forms.
 */

export interface IdentityFieldLabels {
  label: string;
  placeholder: string;
  helperText?: string;
  validationError: string;
}

export interface ProfileFieldLabels {
  identityName: IdentityFieldLabels;
}

const ROLE_LABELS: Record<string, ProfileFieldLabels> = {
  PERFORMER: {
    identityName: {
      label: "ARTIST NAME / STAGE NAME",
      placeholder: "Your artist or stage name",
      helperText: "This is the name fans will see on your profile and in rankings.",
      validationError: "Artist name is required.",
    },
  },
  ARTIST: {
    identityName: {
      label: "ARTIST NAME / STAGE NAME",
      placeholder: "Your artist or stage name",
      validationError: "Artist name is required.",
    },
  },
  MUSICIAN: {
    identityName: {
      label: "ARTIST NAME / STAGE NAME",
      placeholder: "Your artist or stage name",
      validationError: "Artist name is required.",
    },
  },
  PRODUCER: {
    identityName: {
      label: "PRODUCER NAME / BRAND",
      placeholder: "Your producer name or brand",
      validationError: "Producer name is required.",
    },
  },
  WRITER: {
    identityName: {
      label: "DISPLAY NAME / PUBLICATION",
      placeholder: "Your name or publication",
      validationError: "Display name is required.",
    },
  },
  BAND: {
    identityName: {
      label: "BAND NAME",
      placeholder: "Your band's name",
      validationError: "Band name is required.",
    },
  },
  VENUE: {
    identityName: {
      label: "VENUE NAME",
      placeholder: "Your venue's name",
      helperText: "Shown on your venue profile and booking listings.",
      validationError: "Venue name is required.",
    },
  },
  PROMOTER: {
    identityName: {
      label: "PROMOTER / COMPANY NAME",
      placeholder: "Your company or promoter name",
      validationError: "Company name is required.",
    },
  },
  VENUE_PROFESSIONAL: {
    identityName: {
      label: "VENUE / COMPANY NAME",
      placeholder: "Your venue or company name",
      validationError: "Venue or company name is required.",
    },
  },
  SPONSOR: {
    identityName: {
      label: "BUSINESS NAME",
      placeholder: "Your company or brand name",
      validationError: "Business name is required.",
    },
  },
  ADVERTISER: {
    identityName: {
      label: "BUSINESS NAME",
      placeholder: "Your business or brand name",
      validationError: "Business name is required.",
    },
  },
  BUSINESS: {
    identityName: {
      label: "BUSINESS NAME",
      placeholder: "Your business or brand name",
      validationError: "Business name is required.",
    },
  },
  FAN: {
    identityName: {
      label: "DISPLAY NAME",
      placeholder: "Your name or username",
      validationError: "Display name is required.",
    },
  },
  USER: {
    identityName: {
      label: "DISPLAY NAME",
      placeholder: "Your name or username",
      validationError: "Display name is required.",
    },
  },
};

const DEFAULT_LABELS: ProfileFieldLabels = {
  identityName: {
    label: "DISPLAY NAME",
    placeholder: "Your name",
    validationError: "Name is required.",
  },
};

/**
 * Returns role-appropriate field labels for profile identity inputs.
 * Falls back to generic "DISPLAY NAME" for unknown or null roles.
 */
export function getProfileFieldLabels(role?: string | null): ProfileFieldLabels {
  if (!role) return DEFAULT_LABELS;
  return ROLE_LABELS[role.toUpperCase()] ?? DEFAULT_LABELS;
}
