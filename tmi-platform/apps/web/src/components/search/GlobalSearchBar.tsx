'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  kind: 'profile' | 'live_room' | 'article' | 'track';
  title: string;
  subtitle?: string;
  href: string;
  imageUrl?: string | null;
  isLive?: boolean;
  viewerCount?: number;
}

interface SearchGrouped {
  profiles?: SearchResult[];
  liveRooms?: SearchResult[];
  articles?: SearchResult[];
  tracks?: SearchResult[];
}

const KIND_LABEL: Record<SearchResult['kind'], string> = {
  profile: 'PROFILE',
  live_room: 'LIVE ROOM',
  article: 'ARTICLE',
  track: 'TRACK',
};

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [grouped, setGrouped] = useState<SearchGrouped>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setGrouped({}); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then((d: { grouped?: SearchGrouped }) => { setGrouped(d.grouped ?? {}); })
      .catch(() => setGrouped({}))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setOpen(!!q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 280);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  const totalResults =
    (grouped.liveRooms?.length ?? 0) +
    (grouped.profiles?.length ?? 0) +
    (grouped.tracks?.length ?? 0) +
    (grouped.articles?.length ?? 0);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} role="search" aria-label="Search TMI">
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px' }}>
        <span style={{ fontSize: 12, opacity: 0.5 }} aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search artists, rooms, tracks… (press /)"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query) setOpen(true); }}
          aria-controls="tmi-search-dropdown"
          aria-expanded={open}
          aria-autocomplete="list"
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 11, fontFamily: 'inherit' }}
        />
        {loading && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>…</span>}
        {query && !loading && (
          <button type="button" onClick={() => { setQuery(''); setGrouped({}); setOpen(false); }} aria-label="Clear" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1 }}>✕</button>
        )}
      </form>

      {open && query && (
        <div
          id="tmi-search-dropdown"
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 9999,
            background: '#0a0a1a', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.8)', maxHeight: 480, overflowY: 'auto',
          }}
        >
          {totalResults === 0 && !loading && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* LIVE NOW — video-first */}
          {(grouped.liveRooms?.length ?? 0) > 0 && (
            <ResultGroup label="LIVE NOW" accent="#FF2DAA">
              {grouped.liveRooms!.slice(0, 4).map(r => (
                <SearchResultRow key={r.id} result={r} onSelect={() => setOpen(false)} />
              ))}
            </ResultGroup>
          )}

          {/* PROFILES */}
          {(grouped.profiles?.length ?? 0) > 0 && (
            <ResultGroup label="PROFILES" accent="#00FFFF">
              {grouped.profiles!.slice(0, 5).map(r => (
                <SearchResultRow key={r.id} result={r} onSelect={() => setOpen(false)} />
              ))}
            </ResultGroup>
          )}

          {/* TRACKS */}
          {(grouped.tracks?.length ?? 0) > 0 && (
            <ResultGroup label="TRACKS" accent="#AA2DFF">
              {grouped.tracks!.slice(0, 4).map(r => (
                <SearchResultRow key={r.id} result={r} onSelect={() => setOpen(false)} />
              ))}
            </ResultGroup>
          )}

          {/* ARTICLES */}
          {(grouped.articles?.length ?? 0) > 0 && (
            <ResultGroup label="MAGAZINE" accent="#FFD700">
              {grouped.articles!.slice(0, 3).map(r => (
                <SearchResultRow key={r.id} result={r} onSelect={() => setOpen(false)} />
              ))}
            </ResultGroup>
          )}

          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '10px 14px', textAlign: 'center', color: '#00FFFF', fontSize: 11, fontWeight: 700, textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            See all results for &ldquo;{query}&rdquo; →
          </Link>
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ padding: '8px 14px 4px', fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: accent }}>{label}</div>
      {children}
    </div>
  );
}

function SearchResultRow({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  return (
    <Link
      href={result.href}
      onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* thumbnail */}
      <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a2e', position: 'relative' }}>
        {result.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={result.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              {result.kind === 'live_room' ? '🎭' : result.kind === 'track' ? '🎵' : result.kind === 'article' ? '📰' : '👤'}
            </span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
          {result.title}
          {result.isLive && <span style={{ fontSize: 7, fontWeight: 900, color: '#fff', background: '#FF2DAA', borderRadius: 3, padding: '1px 5px' }}>● LIVE{result.viewerCount ? ` · ${result.viewerCount}` : ''}</span>}
        </div>
        {result.subtitle && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.subtitle}</div>}
      </div>
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{KIND_LABEL[result.kind]}</span>
    </Link>
  );
}
