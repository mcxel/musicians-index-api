"use server";
import { buildPhase1Batch } from "@/lib/email/Phase1OnboardingEmail";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tmi.berntoutglobal.com";
const DEFAULT_ENTRY = `${BASE_URL}/rooms/world-dance-party`;

export interface InviteRecipient {
  name: string;
  email: string;
  note?: string;
}

export interface InviteResult {
  email: string;
  success: boolean;
  provider: string;
  error?: string;
}

export interface SendInvitesReturn {
  ok: boolean;
  sent: number;
  failed: number;
  results: InviteResult[];
  error?: string;
}

/**
 * Parse free-form text into a recipient list.
 * Supported formats per line:
 *   Christina F leeanncoats.79@gmail.com
 *   leeanncoats.79@gmail.com
 *   Christina F <leeanncoats.79@gmail.com>
 *   Christina F | leeanncoats.79@gmail.com | optional note
 */
function parseRecipients(raw: string): InviteRecipient[] {
  const lines = raw.split(/[\n,]/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const out: InviteRecipient[] = [];

  for (const line of lines) {
    // Pipe-delimited: Name | email | note
    if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim());
      const email = parts.find((p) => p.includes("@"))?.toLowerCase() ?? "";
      if (!email) continue;
      const name = parts.find((p) => !p.includes("@") && p.length > 0) ?? "";
      const note = parts.length >= 3 ? parts[2] : undefined;
      out.push({ name, email, note });
      continue;
    }

    // Angle-bracket: Name <email>
    const angleMatch = line.match(/^(.*?)<([^>]+@[^>]+)>/);
    if (angleMatch) {
      out.push({ name: angleMatch[1]!.trim(), email: angleMatch[2]!.trim().toLowerCase() });
      continue;
    }

    // Space-separated: last token is email if it has @
    const tokens = line.split(/\s+/);
    const emailToken = tokens.find((t) => t.includes("@"));
    if (emailToken) {
      const name = tokens.filter((t) => t !== emailToken).join(" ").trim();
      out.push({ name, email: emailToken.toLowerCase() });
    }
  }

  // Deduplicate by email, cap at 20
  const seen = new Set<string>();
  return out.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  }).slice(0, 20);
}

export async function sendInvitesAction(
  rawText: string,
  entryUrl?: string,
): Promise<SendInvitesReturn> {
  const recipients = parseRecipients(rawText);

  if (recipients.length === 0) {
    return { ok: false, sent: 0, failed: 0, results: [], error: "No valid email addresses found" };
  }

  const url = entryUrl?.trim() || DEFAULT_ENTRY;

  const messages = buildPhase1Batch(
    recipients.map((r) => ({
      recipientName:  r.name,
      recipientEmail: r.email,
      entryUrl:       url,
      personalNote:   r.note,
    })),
    url,
  );

  const results: InviteResult[] = [];

  for (const msg of messages) {
    const result = await EmailProviderEngine.sendAsync({
      to:      msg.to,
      subject: msg.subject,
      html:    msg.html,
      text:    msg.text,
      tags:    ["phase1-invite", "admin-ui"],
    });
    results.push({
      email:    msg.to,
      success:  result.success,
      provider: result.provider,
      error:    result.error,
    });
  }

  const sent   = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`[admin-ui/invites] sent:${sent} failed:${failed}`);

  return { ok: failed === 0, sent, failed, results };
}
