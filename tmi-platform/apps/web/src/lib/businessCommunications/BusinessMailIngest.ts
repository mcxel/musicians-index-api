import {
  pollHostingerInbox,
  type PolledInboxMessage,
} from "./HostingerMailAdapter";
import { triageRawMessage, enqueueTriagedMessage } from "./BusinessMessageTriage";
import type { BusinessMessage } from "./types";

const seenMessageIds = new Set<string>();
const MAX_SEEN = 2000;

function rememberMessageId(id: string): boolean {
  if (seenMessageIds.has(id)) return false;
  seenMessageIds.add(id);
  if (seenMessageIds.size > MAX_SEEN) {
    const first = seenMessageIds.values().next().value;
    if (first) seenMessageIds.delete(first);
  }
  return true;
}

export function ingestPolledMessages(raw: PolledInboxMessage[]): {
  triaged: BusinessMessage[];
  skippedDuplicates: number;
} {
  const triaged: BusinessMessage[] = [];
  let skippedDuplicates = 0;

  for (const row of raw) {
    const dedupeKey = row.messageId || `${row.uid}-${row.receivedAt}`;
    if (!rememberMessageId(dedupeKey)) {
      skippedDuplicates++;
      continue;
    }

    const msg = triageRawMessage({
      mailboxIdentity: row.mailboxIdentity,
      from: row.from,
      to: row.to,
      subject: row.subject,
      body: row.body,
      threadId: row.messageId,
      receivedAt: row.receivedAt,
    });
    enqueueTriagedMessage(msg);
    triaged.push(msg);
  }

  return { triaged, skippedDuplicates };
}

/** Poll Hostinger INBOX and enqueue into Big Ace triage work queue. */
export async function pollInboxIntoTriage(options?: { limit?: number }) {
  const poll = await pollHostingerInbox(options);
  if (!poll.ok) {
    return {
      ok: false as const,
      error: poll.error,
      configured: poll.configured,
      triaged: 0,
      polled: 0,
    };
  }

  const { triaged, skippedDuplicates } = ingestPolledMessages(poll.messages);
  return {
    ok: true as const,
    triaged: triaged.length,
    polled: poll.messages.length,
    skippedDuplicates,
    polledAt: poll.polledAt,
    messages: triaged,
  };
}
