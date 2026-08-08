import type { MailboxConfigSnapshot, MailboxConnectionState } from "./types";
import {
  getBusinessMailboxIdentities,
  getHostingerMailConfigStatus,
} from "./HostingerMailAdapter";

const SCOPED_ALIASES = [
  "sponsors",
  "advertising",
  "booking",
  "magazine",
  "support",
  "legal",
] as const;

function domainFromEnv(): string {
  return (
    process.env.BUSINESS_MAIL_DOMAIN ??
    process.env.EMAIL_FROM_ADDRESS?.split("@")[1] ??
    "themusiciansindex.com"
  );
}

export function getScopedBusinessAddresses(): string[] {
  const domain = domainFromEnv();
  return SCOPED_ALIASES.map((local) => {
    const override = process.env[`BUSINESS_MAIL_${local.toUpperCase()}`];
    if (override?.includes("@")) return override;
    return `${local}@${domain}`;
  });
}

/**
 * Server-side mailbox capability — credentials stay in env; never passed to client or bot prompts.
 */
export function getMailboxConfigSnapshot(): MailboxConfigSnapshot {
  const hostinger = getHostingerMailConfigStatus();
  const hasSmtp = hostinger.smtpReady;
  const hasImap = hostinger.imapReady;

  let state: MailboxConnectionState = "not_configured";
  let detail = "No outbound or inbound mailbox credentials configured.";

  if (hasImap && hasSmtp) {
    state = "imap_inbound_ready";
    detail =
      "Hostinger IMAP inbound + outbound send path configured (server-side only). admin@ private inbox; support@ public alias.";
  } else if (hasSmtp) {
    state = "smtp_outbound_only";
    detail =
      "Outbound send available; inbound IMAP not configured — triage uses manual/API-ingested messages only.";
  } else if (hostinger.imapReady) {
    state = "error";
    detail = "IMAP host set but SMTP/Resend outbound missing — cannot complete send loop.";
  }

  return {
    state,
    inboundConfigured: hasImap,
    outboundConfigured: hasSmtp,
    scopedAddresses: getScopedBusinessAddresses(),
    identities: getBusinessMailboxIdentities(),
    detail,
  };
}

export { getBusinessMailboxIdentities, getAdminMailboxAddress, getSupportMailboxAddress } from "./HostingerMailAdapter";
