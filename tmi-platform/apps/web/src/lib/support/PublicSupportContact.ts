/**
 * Canonical public support contact — App Store / Play Store listings and /support surfaces.
 */

export const TMI_SUPPORT_EMAIL = "support@themusiciansindex.com";
export const TMI_SUPPORT_MAILTO = `mailto:${TMI_SUPPORT_EMAIL}`;

/** Private developer/admin mailbox (Hostinger paid inbox; not shown on public surfaces). */
export const TMI_ADMIN_MAILBOX_EMAIL =
  process.env.BUSINESS_MAIL_ADMIN ?? "admin@themusiciansindex.com";

export const TMI_APP_STORE_SUPPORT = {
  contactEmail: TMI_SUPPORT_EMAIL,
  contactUrl: "https://themusiciansindex.com/support",
  privacyPolicyUrl: "https://themusiciansindex.com/privacy",
  termsOfServiceUrl: "https://themusiciansindex.com/terms",
} as const;
