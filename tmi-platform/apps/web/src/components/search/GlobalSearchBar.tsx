'use client';
// GlobalSearchBar.tsx — Universal search bar, keyboard shortcut: "/"
// Copilot wires: useSearch(query, type), debounce 300ms, live room boost
// Proof: results show, Enter navigates, Escape closes, live rooms appear first
import { useState, useEffect, useRef } from 'react';
export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault(); ref.current?.focus(); setOpen(true);
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  return (
    <div className="tmi-search" role="search" aria-label="Search TMI">
      <div className="tmi-search__bar">
        <span className="tmi-search__icon" aria-hidden="true">🔍</span>
        <input
          ref={ref}
          className="tmi-search__input"
          type="search"
          placeholder='Search artists, rooms, beats... (press /)'
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(!!e.target.value); }}
          aria-controls="tmi-search-results"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {query && <button className="tmi-search__clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>}
      </div>
      {open && (
        <div className="tmi-search__results" id="tmi-search-results" role="listbox" data-slot="results">
          {/* Copilot maps grouped results: LIVE NOW, ARTISTS, ROOMS, BEATS, ARTICLES */}
          <div className="tmi-search__group">
            <div className="tmi-search__group-label">LIVE NOW</div>
            <div data-slot="live-results">{/* live rooms matching query */}</div>
          </div>
          <div className="tmi-search__group">
            <div className="tmi-search__group-label">ARTISTS</div>
            <div data-slot="artist-results">{/* artist results */}</div>
          </div>
          <div className="tmi-search__group">
            <div className="tmi-search__group-label">BEATS</div>
            <div data-slot="beat-results">{/* beat results */}</div>
          </div>
          <a href={`/search?q=${query}`} className="tmi-search__see-all">See all results →</a>
        </div>
      )}
    </div>
  );
}
