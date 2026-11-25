"use client";

/**
 * usePageWritingContent — adapts canonical PAGE_WRITING Content objects into
 * PersonalWritingWall's existing PersonalWritingEntry shape, replacing the
 * personalWritings JSON path (structurally proven to have no persistence
 * destination — see ContentService.ts / schema.prisma comments). The wall
 * component itself is unmodified; only where its data comes from/goes to
 * changes.
 *
 * Known limitation of this first slice: PersonalWritingWall seeds its
 * internal activeWritings state from props only once on mount, so a second
 * edit of the *same* just-created entry within the same browser session
 * (before a reload) can create a duplicate Content row rather than update
 * the first one. A hard reload always shows the correct, deduplicated
 * server truth. Fixing same-session multi-edit reconciliation is follow-up
 * work, not part of proving the spine.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { PersonalWritingEntry } from "@/lib/profile/PublicProfileStyleEngine";
import type { MediaBlock } from "@/components/profile/PublicProfileMediaComposer";

interface ContentItem {
  id: string;
  title: string | null;
  body: string;
  visibility: "PUBLIC" | "FRIENDS" | "PRIVATE";
}

const KNOWN_TITLES: Record<string, PersonalWritingEntry["type"]> = {
  "THOUGHT OF THE DAY": "THOUGHT_OF_DAY",
  "HAPPY DAY QUOTE": "HAPPY_DAY_QUOTE",
  "THINGS THAT MAKE ME HAPPY": "THINGS_THAT_MAKE_ME_HAPPY",
  "CURRENT VIBE": "CURRENT_VIBE",
};

const TYPE_STYLE: Record<PersonalWritingEntry["type"], PersonalWritingEntry["styleVariant"]> = {
  THOUGHT_OF_DAY: "NEON_SIGN",
  HAPPY_DAY_QUOTE: "PULL_QUOTE",
  THINGS_THAT_MAKE_ME_HAPPY: "NOTE_CARD",
  CURRENT_VIBE: "MINIMAL",
  CUSTOM_TEXT: "NOTE_CARD",
};

function contentToEntry(item: ContentItem): PersonalWritingEntry {
  const type = (item.title && KNOWN_TITLES[item.title]) || "CUSTOM_TEXT";
  return {
    id: item.id,
    type,
    title: item.title ?? "NOTE",
    body: item.body,
    visibility: item.visibility,
    styleVariant: TYPE_STYLE[type],
  };
}

export type PageWritingMode = { mode: "owner" } | { mode: "public"; slug: string };

/**
 * Public-render bridge: projects live PAGE_WRITING entries into
 * PublicProfileMediaComposer's existing MediaBlock system, referencing the
 * canonical Content by id rather than becoming a second stored copy — the
 * title/body here are a same-request read of the exact data
 * usePageWritingContent just fetched, never an independently cached value.
 */
export function toContentMediaBlocks(writings: PersonalWritingEntry[]): MediaBlock[] {
  return writings
    .filter((w) => w.visibility === "PUBLIC")
    .map((w) => ({
      id: `content-${w.id}`,
      type: "CONTENT",
      contentId: w.id,
      contentTitle: w.title,
      contentBody: w.body,
    }));
}

export function usePageWritingContent(opts: PageWritingMode) {
  const [writings, setWritings] = useState<PersonalWritingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const writingsRef = useRef<PersonalWritingEntry[]>([]);
  writingsRef.current = writings;

  const slugKey = opts.mode === "public" ? opts.slug : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        opts.mode === "owner"
          ? "/api/content?contentType=PAGE_WRITING"
          : `/api/content/public?slug=${encodeURIComponent(slugKey ?? "")}&contentType=PAGE_WRITING`;
      const res = await fetch(url, { cache: "no-store", credentials: "include" });
      const data = await res.json();
      const items: ContentItem[] = data?.ok ? (data.items ?? []) : [];
      setWritings(items.map(contentToEntry));
    } catch {
      setWritings([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.mode, slugKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = useCallback(
    async (next: PersonalWritingEntry[]) => {
      if (opts.mode !== "owner") return; // owner-only mutation path
      const prevById = new Map(writingsRef.current.map((w) => [w.id, w]));
      for (const entry of next) {
        const prev = prevById.get(entry.id);
        try {
          if (!prev) {
            const res = await fetch("/api/content", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                contentType: "PAGE_WRITING",
                title: entry.title,
                body: entry.body,
                visibility: entry.visibility,
              }),
            });
            const data = await res.json();
            if (data?.ok && data.content?.id) {
              // Bind the canonical Content ID onto the SAME object reference
              // PersonalWritingWall's own activeWritings/editingEntry state
              // holds. Without this, a second same-session edit of a
              // just-created entry would still carry the local temp id,
              // fail the prevById lookup below, and POST a duplicate
              // instead of PUT-ing the existing row.
              entry.id = data.content.id;
            }
          } else if (
            prev.body !== entry.body ||
            prev.title !== entry.title ||
            prev.visibility !== entry.visibility
          ) {
            await fetch(`/api/content/${entry.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ title: entry.title, body: entry.body, visibility: entry.visibility }),
            });
          }
        } catch {
          // Network failure — local state already reflects the attempt;
          // a hard reload will show real server truth either way.
        }
      }
      // In-place mutation above keeps object identity intact (no remount),
      // so PersonalWritingWall's own uncontrolled state stays correct without
      // a full server round-trip/replace on every keystroke-triggered save.
      setWritings([...next]);
    },
    [opts.mode],
  );

  return { writings, loading, handleUpdate, reload: load };
}
