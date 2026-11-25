"use client";

/**
 * MusicCollectionLibrary — §20995-X visual My Music Library grid.
 * Real coverUrl / song artwork only — never decorative fake placeholders.
 */

import { useMemo, useState, type CSSProperties } from "react";

export type MusicLibraryTab = "playlists" | "albums" | "singles";
export type MusicLibraryLayout = "grid" | "list";

export interface MusicCollectionCard {
  id: string;
  title: string;
  kind: "playlist" | "album" | "single";
  coverUrl?: string | null;
  trackCount?: number;
  creatorLabel?: string;
  subtitle?: string;
}

export interface MusicCollectionLibraryProps {
  accentColor?: string;
  playlists: MusicCollectionCard[];
  albums: MusicCollectionCard[];
  singles: MusicCollectionCard[];
  selectedId?: string | null;
  layout?: MusicLibraryLayout;
  onLayoutChange?: (layout: MusicLibraryLayout) => void;
  onSelect?: (card: MusicCollectionCard) => void;
  onPlay?: (card: MusicCollectionCard) => void;
  onAdd?: () => void;
  onEditCover?: (card: MusicCollectionCard) => void;
  onShare?: (card: MusicCollectionCard) => void;
  onAddTracks?: (card: MusicCollectionCard) => void;
  isOwner?: boolean;
}

export default function MusicCollectionLibrary({
  accentColor = "#7DD3FC",
  playlists,
  albums,
  singles,
  selectedId = null,
  layout: layoutProp,
  onLayoutChange,
  onSelect,
  onPlay,
  onAdd,
  onEditCover,
  onShare,
  onAddTracks,
  isOwner = false,
}: MusicCollectionLibraryProps) {
  const [tab, setTab] = useState<MusicLibraryTab>("playlists");
  const [layoutLocal, setLayoutLocal] = useState<MusicLibraryLayout>("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "title" | "tracks">("recent");

  const layout = layoutProp ?? layoutLocal;
  const setLayout = (next: MusicLibraryLayout) => {
    onLayoutChange?.(next);
    if (!layoutProp) setLayoutLocal(next);
  };

  const source = tab === "playlists" ? playlists : tab === "albums" ? albums : singles;

  const cards = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = source;
    if (q) {
      rows = rows.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.creatorLabel ?? "").toLowerCase().includes(q) ||
          (c.subtitle ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...rows];
    if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "tracks") sorted.sort((a, b) => (b.trackCount ?? 0) - (a.trackCount ?? 0));
    return sorted;
  }, [source, query, sort]);

  return (
    <div
      data-testid="music-collection-library"
      data-music-collection-library="1"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 4,
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.04em", color: accentColor }}>
            MY MUSIC LIBRARY
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Your playlists, albums and singles
          </div>
        </div>
        {isOwner && onAdd ? (
          <button type="button" data-testid="music-library-add" onClick={onAdd} style={pill(accentColor)}>
            + Add
          </button>
        ) : null}
      </div>

      <div role="tablist" aria-label="Collection type" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(
          [
            ["playlists", "Playlists"],
            ["albums", "Albums"],
            ["singles", "Singles"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            data-testid={`music-tab-${id}`}
            onClick={() => setTab(id)}
            style={{
              ...pill(tab === id ? accentColor : "rgba(255,255,255,0.35)"),
              background: tab === id ? "rgba(255,255,255,0.1)" : "transparent",
              borderRadius: 999,
              padding: "7px 14px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="search"
          aria-label="Search collections"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 140,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 11,
            fontFamily: "inherit",
          }}
        />
        <select
          aria-label="Sort collections"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 10,
            fontFamily: "inherit",
          }}
        >
          <option value="recent">Recent</option>
          <option value="title">Title</option>
          <option value="tracks">Track count</option>
        </select>
        <button type="button" onClick={() => setLayout("grid")} style={pill(layout === "grid" ? accentColor : "rgba(255,255,255,0.35)")}>
          GRID
        </button>
        <button type="button" onClick={() => setLayout("list")} style={pill(layout === "list" ? accentColor : "rgba(255,255,255,0.35)")}>
          LIST
        </button>
      </div>

      {cards.length === 0 ? (
        <div
          data-testid="music-library-empty"
          style={{
            padding: 28,
            textAlign: "center",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {tab === "singles"
            ? "No singles in your library yet. Use + Add to upload or import."
            : tab === "albums"
              ? "No album collections yet. Use + Add → Album destination."
              : "No playlists yet. Use + Add to create one with real artwork."}
        </div>
      ) : layout === "grid" ? (
        <div
          data-testid="music-library-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 14,
          }}
        >
          {cards.map((card) => (
            <CollectionTile
              key={card.id}
              card={card}
              accentColor={accentColor}
              selected={selectedId === card.id}
              isOwner={isOwner}
              onSelect={onSelect}
              onPlay={onPlay}
              onEditCover={onEditCover}
              onShare={onShare}
              onAddTracks={onAddTracks}
            />
          ))}
        </div>
      ) : (
        <div data-testid="music-library-list" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cards.map((card) => (
            <CollectionRow
              key={card.id}
              card={card}
              accentColor={accentColor}
              selected={selectedId === card.id}
              isOwner={isOwner}
              onSelect={onSelect}
              onPlay={onPlay}
              onEditCover={onEditCover}
              onShare={onShare}
              onAddTracks={onAddTracks}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function kindLabel(kind: MusicCollectionCard["kind"]): string {
  if (kind === "album") return "Album";
  if (kind === "single") return "Single";
  return "Playlist";
}

function CoverArt({
  coverUrl,
  title,
  accentColor,
  size,
}: {
  coverUrl?: string | null;
  title: string;
  accentColor: string;
  size: number | string;
}) {
  return (
    <div
      style={{
        width: size,
        height: typeof size === "number" ? size : undefined,
        aspectRatio: typeof size === "string" ? "1" : undefined,
        borderRadius: 10,
        overflow: "hidden",
        background: `linear-gradient(145deg, ${accentColor}33, #12081c 60%, #050510)`,
        border: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div
          data-testid="music-cover-empty"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 4,
            color: "rgba(255,255,255,0.35)",
            fontSize: 10,
            padding: 8,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 22 }}>♪</span>
          No cover yet
        </div>
      )}
      {!coverUrl ? null : (
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{title}</span>
      )}
    </div>
  );
}

function CollectionTile({
  card,
  accentColor,
  selected,
  isOwner,
  onSelect,
  onPlay,
  onEditCover,
  onShare,
  onAddTracks,
}: {
  card: MusicCollectionCard;
  accentColor: string;
  selected: boolean;
  isOwner: boolean;
  onSelect?: (c: MusicCollectionCard) => void;
  onPlay?: (c: MusicCollectionCard) => void;
  onEditCover?: (c: MusicCollectionCard) => void;
  onShare?: (c: MusicCollectionCard) => void;
  onAddTracks?: (c: MusicCollectionCard) => void;
}) {
  return (
    <div
      data-testid={`music-card-${card.kind}-${card.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 4,
        borderRadius: 12,
        border: selected ? `1px solid ${accentColor}` : "1px solid transparent",
        background: selected ? `${accentColor}14` : "transparent",
      }}
    >
      <button
        type="button"
        onClick={() => onSelect?.(card)}
        style={{ all: "unset", cursor: "pointer", display: "block" }}
        aria-label={`Open ${card.title}`}
      >
        <CoverArt coverUrl={card.coverUrl} title={card.title} accentColor={accentColor} size="100%" />
      </button>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{card.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
          {kindLabel(card.kind)}
          {typeof card.trackCount === "number" ? ` · ${card.trackCount} track${card.trackCount === 1 ? "" : "s"}` : ""}
          {card.creatorLabel ? ` · ${card.creatorLabel}` : ""}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {onPlay ? (
          <button type="button" onClick={() => onPlay(card)} style={miniBtn(accentColor)}>
            ▶
          </button>
        ) : null}
        {isOwner && onAddTracks && card.kind !== "single" ? (
          <button type="button" onClick={() => onAddTracks(card)} style={miniBtn("#00FF88")}>
            +
          </button>
        ) : null}
        {isOwner && onEditCover ? (
          <button type="button" onClick={() => onEditCover(card)} style={miniBtn("#FF2DAA")}>
            ✎
          </button>
        ) : null}
        {onShare ? (
          <button type="button" onClick={() => onShare(card)} style={miniBtn("#00FFFF")}>
            ↗
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CollectionRow({
  card,
  accentColor,
  selected,
  isOwner,
  onSelect,
  onPlay,
  onEditCover,
  onShare,
  onAddTracks,
}: {
  card: MusicCollectionCard;
  accentColor: string;
  selected: boolean;
  isOwner: boolean;
  onSelect?: (c: MusicCollectionCard) => void;
  onPlay?: (c: MusicCollectionCard) => void;
  onEditCover?: (c: MusicCollectionCard) => void;
  onShare?: (c: MusicCollectionCard) => void;
  onAddTracks?: (c: MusicCollectionCard) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 8,
        borderRadius: 10,
        border: selected ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.08)",
        background: selected ? `${accentColor}14` : "rgba(255,255,255,0.03)",
      }}
    >
      <button type="button" onClick={() => onSelect?.(card)} style={{ all: "unset", cursor: "pointer" }}>
        <CoverArt coverUrl={card.coverUrl} title={card.title} accentColor={accentColor} size={56} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>{card.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          {kindLabel(card.kind)}
          {typeof card.trackCount === "number" ? ` · ${card.trackCount} tracks` : ""}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {onPlay ? (
          <button type="button" onClick={() => onPlay(card)} style={miniBtn(accentColor)}>
            ▶
          </button>
        ) : null}
        {isOwner && onAddTracks && card.kind !== "single" ? (
          <button type="button" onClick={() => onAddTracks(card)} style={miniBtn("#00FF88")}>
            +
          </button>
        ) : null}
        {isOwner && onEditCover ? (
          <button type="button" onClick={() => onEditCover(card)} style={miniBtn("#FF2DAA")}>
            ✎
          </button>
        ) : null}
        {onShare ? (
          <button type="button" onClick={() => onShare(card)} style={miniBtn("#00FFFF")}>
            ↗
          </button>
        ) : null}
      </div>
    </div>
  );
}

function pill(color: string): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
    padding: "8px 14px",
    borderRadius: 999,
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function miniBtn(color: string): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 900,
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
