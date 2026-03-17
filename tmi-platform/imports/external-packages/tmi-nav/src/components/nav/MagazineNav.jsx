/**
 * TMI — MAGAZINE NAVIGATION SYSTEM
 * ══════════════════════════════════
 * 4 navigation modes in one:
 *
 * 1. GUIDED MAGAZINE MODE — artist → article → random → repeat
 * 2. JUMP MODE  — instant section teleport
 * 3. SEARCH MODE — global search across all content types
 * 4. RECENT PAGE MEMORY — last 20 visited pages, bookmarks
 *
 * All in the same TMI HUD / neon magazine visual language.
 * Zero generic SaaS UI.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MagazineNav.css';

// ─────────────────────────────────────────────────────────
// SECTION DIRECTORY  (jump targets)
// ─────────────────────────────────────────────────────────
export const SECTIONS = [
  { id:'home',       label:'Home / Cover',       icon:'🏠', group:'discover',  color:'#FF6B00' },
  { id:'preview',    label:'Preview Wall',        icon:'👁', group:'discover',  color:'#00D4FF' },
  { id:'artists',    label:'Artists',             icon:'🎤', group:'discover',  color:'#00D4FF' },
  { id:'articles',   label:'News & Articles',     icon:'📰', group:'read',      color:'#FFB800' },
  { id:'billboard',  label:'Billboard Charts',    icon:'🏆', group:'read',      color:'#FFD700' },
  { id:'polls',      label:'Fan Polls',           icon:'🗳', group:'engage',    color:'#00FF88' },
  { id:'live',       label:'Live Rooms',          icon:'🔴', group:'live',      color:'#FF2244' },
  { id:'shows',      label:'Shows',               icon:'🎪', group:'live',      color:'#FF1493' },
  { id:'games',      label:'Game Night',          icon:'🎮', group:'live',      color:'#D400FF' },
  { id:'contests',   label:'Contests',            icon:'🏅', group:'live',      color:'#FF6B00' },
  { id:'winners',    label:"Winners' Hall",       icon:'👑', group:'live',      color:'#FFD700' },
  { id:'sponsors',   label:'Sponsors',            icon:'💼', group:'money',     color:'#FFB800' },
  { id:'store',      label:'TMI Store',           icon:'🛍', group:'money',     color:'#00FF88' },
  { id:'horoscope',  label:'Creator Horoscope',   icon:'✦', group:'lifestyle', color:'#D400FF' },
  { id:'throwback',  label:'Throwback Issues',    icon:'📼', group:'lifestyle', color:'#FF6B00' },
  { id:'seasonal',   label:'Seasonal Issues',     icon:'🌸', group:'lifestyle', color:'#00D4FF' },
  { id:'fan',        label:'Fan Pages',           icon:'❤️', group:'community', color:'#FF1493' },
  { id:'bookmarks',  label:'My Bookmarks',        icon:'🔖', group:'personal',  color:'#FFB800' },
  { id:'recent',     label:'Recent Pages',        icon:'🕐', group:'personal',  color:'#5A6080' },
  { id:'admin',      label:'Admin Command',       icon:'🛡', group:'admin',     color:'#FF2244' },
];

export const GROUPS = {
  discover:  { label:'DISCOVER',   color:'var(--neon-cyan)' },
  read:      { label:'READ',       color:'var(--neon-gold)' },
  engage:    { label:'ENGAGE',     color:'var(--neon-green)' },
  live:      { label:'LIVE & SHOWS',color:'var(--neon-pink)' },
  money:     { label:'EARN & BUY', color:'var(--neon-orange)' },
  lifestyle: { label:'LIFESTYLE',  color:'var(--neon-magenta)' },
  community: { label:'COMMUNITY',  color:'var(--neon-pink)' },
  personal:  { label:'MY STUFF',   color:'var(--text-muted)' },
  admin:     { label:'ADMIN',      color:'var(--neon-red)' },
};

// ─────────────────────────────────────────────────────────
// RECENT PAGE MEMORY HOOK
// ─────────────────────────────────────────────────────────
export function usePageMemory(maxPages = 20) {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('tmi_nav_history') || '[]'); }
    catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tmi_bookmarks') || '[]'); }
    catch { return []; }
  });

  const pushPage = useCallback((page) => {
    setHistory(prev => {
      const entry = {
        ...page,
        visitedAt: Date.now(),
        id: page.id || page.sectionId,
      };
      const filtered = prev.filter(p => !(p.id === entry.id && p.subId === entry.subId));
      const next = [entry, ...filtered].slice(0, maxPages);
      try { sessionStorage.setItem('tmi_nav_history', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [maxPages]);

  const toggleBookmark = useCallback((page) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === page.id && b.subId === page.subId);
      const next = exists ? prev.filter(b => !(b.id===page.id && b.subId===page.subId)) : [...prev, {...page, savedAt:Date.now()}];
      try { localStorage.setItem('tmi_bookmarks', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isBookmarked = useCallback((pageId, subId) => {
    return bookmarks.some(b => b.id===pageId && b.subId===subId);
  }, [bookmarks]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { sessionStorage.removeItem('tmi_nav_history'); } catch {}
  }, []);

  return { history, bookmarks, pushPage, toggleBookmark, isBookmarked, clearHistory };
}

// ─────────────────────────────────────────────────────────
// DEMO SEARCH DATA  (replace with real API calls)
// ─────────────────────────────────────────────────────────
const DEMO_RESULTS = [
  { id:'a1', type:'artist',   title:'Diana Electro',      sub:'Electronic · #847',       icon:'🎤' },
  { id:'a2', type:'artist',   title:'Marco Wave',         sub:'Hip-Hop · #1203',         icon:'🎤' },
  { id:'a3', type:'artist',   title:'Mia Jay',            sub:'R&B · #312',              icon:'🎤' },
  { id:'r1', type:'article',  title:'How Streaming Changed Discovery', sub:'Feature Story',icon:'📰' },
  { id:'r2', type:'article',  title:'Grammy Watch 2026',  sub:'Awards Coverage',         icon:'📰' },
  { id:'g1', type:'game',     title:'Name That Tune',     sub:'Live · 350 playing',      icon:'🎮' },
  { id:'g2', type:'game',     title:'Deal or Feud 1000',  sub:'Show · Sun 8pm',          icon:'🎲' },
  { id:'s1', type:'sponsor',  title:'Nike Partnership',   sub:'Official Apparel Partner',icon:'✓' },
  { id:'h1', type:'horoscope',title:'Aries Creative Forecast', sub:'This Week',          icon:'✦' },
  { id:'b1', type:'billboard',title:'Top 100 Chart',      sub:'Weekly · Updated',        icon:'🏆' },
  { id:'c1', type:'contest',  title:'Beat Battle Finals', sub:'Live · Ends in 2 days',   icon:'🏅' },
  { id:'p1', type:'poll',     title:'Best Genre This Month', sub:'4,200 votes cast',     icon:'🗳' },
  { id:'st1',type:'store',    title:'Founding Artist Bundle', sub:'2,400 pts',           icon:'🛍' },
];

const TYPE_COLORS = {
  artist:'var(--neon-cyan)', article:'var(--neon-gold)', game:'var(--neon-magenta)',
  sponsor:'var(--neon-gold)', horoscope:'var(--neon-magenta)', billboard:'#FFD700',
  contest:'var(--neon-orange)', poll:'var(--neon-green)', store:'var(--neon-orange)',
};

// ─────────────────────────────────────────────────────────
// COMMAND PALETTE (search + jump overlay)
// ─────────────────────────────────────────────────────────
function CommandPalette({ onClose, onNavigate, recentPages, bookmarks }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('jump'); // 'jump' | 'search' | 'recent' | 'bookmarks'
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key==='Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filteredSections = SECTIONS.filter(s =>
    !query || s.label.toLowerCase().includes(query.toLowerCase()) || s.id.includes(query.toLowerCase())
  );

  const filteredResults = DEMO_RESULTS.filter(r =>
    !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.type.includes(query.toLowerCase())
  );

  const activeTab = query ? 'search' : tab;

  return (
    <div className="cmd-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="cmd-palette">
        {/* ── INPUT ── */}
        <div className="cmd-palette__search-bar">
          <span className="cmd-palette__search-icon">⌕</span>
          <input
            ref={inputRef}
            className="cmd-palette__input"
            placeholder="Search artists, articles, games, shows, sponsors…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="cmd-palette__clear" onClick={() => setQuery('')}>✕</button>
          )}
          <kbd className="cmd-palette__esc">ESC</kbd>
        </div>

        {/* ── TABS ── */}
        {!query && (
          <div className="cmd-palette__tabs">
            {[
              { key:'jump',      label:'Jump',      icon:'⚡' },
              { key:'recent',    label:'Recent 20', icon:'🕐' },
              { key:'bookmarks', label:'Bookmarks', icon:'🔖' },
            ].map(t => (
              <button key={t.key}
                className={`cmd-palette__tab ${activeTab===t.key?'is-active':''}`}
                onClick={() => setTab(t.key)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── BODY ── */}
        <div className="cmd-palette__body">

          {/* SEARCH RESULTS */}
          {query && (
            <div className="cmd-results">
              {filteredSections.length > 0 && (
                <div className="cmd-results__group">
                  <div className="cmd-results__group-label">SECTIONS</div>
                  {filteredSections.slice(0,4).map(s => (
                    <button key={s.id} className="cmd-result-row"
                      onClick={() => { onNavigate(s.id); onClose(); }}
                      style={{'--rc':s.color}}>
                      <span className="cmd-result-row__icon">{s.icon}</span>
                      <div className="cmd-result-row__text">
                        <div className="cmd-result-row__title">{s.label}</div>
                        <div className="cmd-result-row__sub">Section</div>
                      </div>
                      <span className="cmd-result-row__type">JUMP</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredResults.length > 0 && (
                <div className="cmd-results__group">
                  <div className="cmd-results__group-label">CONTENT</div>
                  {filteredResults.slice(0,8).map(r => (
                    <button key={r.id} className="cmd-result-row"
                      onClick={() => { onNavigate(r.type, r.id); onClose(); }}
                      style={{'--rc': TYPE_COLORS[r.type]||'var(--neon-cyan)'}}>
                      <span className="cmd-result-row__icon">{r.icon}</span>
                      <div className="cmd-result-row__text">
                        <div className="cmd-result-row__title">{r.title}</div>
                        <div className="cmd-result-row__sub">{r.sub}</div>
                      </div>
                      <span className="cmd-result-row__type">{r.type.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredSections.length===0 && filteredResults.length===0 && (
                <div className="cmd-palette__empty">
                  <span>No results for "{query}"</span>
                  <div className="cmd-palette__empty-tip">Try: artist name, game, show, article, genre…</div>
                </div>
              )}
            </div>
          )}

          {/* JUMP GRID */}
          {!query && activeTab==='jump' && (
            <div className="cmd-jump-grid">
              {Object.entries(GROUPS).map(([groupKey, groupInfo]) => {
                const groupSections = filteredSections.filter(s => s.group===groupKey);
                if (!groupSections.length) return null;
                return (
                  <div key={groupKey} className="cmd-jump-group">
                    <div className="cmd-jump-group__label" style={{color:groupInfo.color}}>{groupInfo.label}</div>
                    <div className="cmd-jump-group__items">
                      {groupSections.map(s => (
                        <button key={s.id} className="cmd-jump-tile"
                          onClick={() => { onNavigate(s.id); onClose(); }}
                          style={{'--tc':s.color}}>
                          <span className="cmd-jump-tile__icon">{s.icon}</span>
                          <span className="cmd-jump-tile__label">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* RECENT 20 */}
          {!query && activeTab==='recent' && (
            <div className="cmd-history-list">
              {recentPages.length === 0 ? (
                <div className="cmd-palette__empty">No recent pages yet. Start exploring!</div>
              ) : (
                recentPages.map((p, i) => (
                  <button key={i} className="cmd-history-row"
                    onClick={() => { onNavigate(p.sectionId || p.id); onClose(); }}>
                    <span className="cmd-history-row__icon">{p.icon || '📄'}</span>
                    <div className="cmd-history-row__text">
                      <div className="cmd-history-row__title">{p.title || p.label}</div>
                      <div className="cmd-history-row__meta">
                        <span className="cmd-history-row__type">{p.type||'page'}</span>
                        <span>·</span>
                        <span>{timeAgo(p.visitedAt)}</span>
                      </div>
                    </div>
                    <span className="cmd-history-row__reopen">Reopen →</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* BOOKMARKS */}
          {!query && activeTab==='bookmarks' && (
            <div className="cmd-history-list">
              {bookmarks.length === 0 ? (
                <div className="cmd-palette__empty">
                  No bookmarks yet.<br/>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>Press 🔖 on any page to save it here.</span>
                </div>
              ) : (
                bookmarks.map((b, i) => (
                  <button key={i} className="cmd-history-row"
                    onClick={() => { onNavigate(b.sectionId||b.id); onClose(); }}>
                    <span className="cmd-history-row__icon">🔖</span>
                    <div className="cmd-history-row__text">
                      <div className="cmd-history-row__title">{b.title||b.label}</div>
                      <div className="cmd-history-row__meta">
                        <span className="cmd-history-row__type">{b.type||'page'}</span>
                        <span>·</span>
                        <span>Saved {timeAgo(b.savedAt)}</span>
                      </div>
                    </div>
                    <span className="cmd-history-row__reopen">Open →</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="cmd-palette__footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
          <span className="cmd-palette__footer-brand">TMI MAGAZINE</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RECENTLY VIEWED RAIL (horizontal tray at page bottom)
// ─────────────────────────────────────────────────────────
function RecentlyViewedRail({ history, onNavigate, onClose }) {
  if (!history.length) return null;
  return (
    <div className="recent-rail">
      <div className="recent-rail__label">🕐 RECENTLY VIEWED</div>
      <div className="recent-rail__scroll">
        {history.slice(0, 10).map((p, i) => (
          <button key={i} className="recent-rail__chip"
            onClick={() => { onNavigate(p.sectionId||p.id); onClose?.(); }}
            title={p.title||p.label}>
            <span>{p.icon||'📄'}</span>
            <span className="recent-rail__chip-label">{p.title||p.label}</span>
          </button>
        ))}
      </div>
      <button className="recent-rail__see-all" onClick={() => onNavigate('recent')}>See all 20 →</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// JUMP QUICK-ACCESS BAR (always visible at top/side)
// ─────────────────────────────────────────────────────────
function JumpBar({ onOpenPalette, onNavigate, currentSection, recentCount }) {
  const HOT_SECTIONS = SECTIONS.filter(s => ['home','preview','live','games','billboard','sponsors'].includes(s.id));
  return (
    <div className="jump-bar">
      {/* Search / Command button */}
      <button className="jump-bar__search-btn" onClick={onOpenPalette}>
        <span className="jump-bar__search-icon">⌕</span>
        <span className="jump-bar__search-placeholder">Search or jump…</span>
        <kbd className="jump-bar__search-kbd">⌘K</kbd>
      </button>

      {/* Hot section chips */}
      <div className="jump-bar__chips">
        {HOT_SECTIONS.map(s => (
          <button key={s.id}
            className={`jump-bar__chip ${currentSection===s.id?'is-active':''}`}
            style={{'--jc':s.color}}
            onClick={() => onNavigate(s.id)}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Recent + Bookmark access */}
      <div className="jump-bar__util">
        <button className="jump-bar__util-btn" onClick={onOpenPalette} title="Recent pages">
          🕐 {recentCount > 0 && <span className="jump-bar__badge">{recentCount}</span>}
        </button>
        <button className="jump-bar__util-btn" onClick={() => onNavigate('bookmarks')} title="Bookmarks">
          🔖
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAGAZINE BREADCRUMB
// ─────────────────────────────────────────────────────────
function MagazineBreadcrumb({ path, onNavigate, onBookmark, isBookmarked }) {
  if (!path.length) return null;
  return (
    <div className="mag-breadcrumb">
      <div className="mag-breadcrumb__path">
        {path.map((step, i) => (
          <React.Fragment key={i}>
            <button className="mag-breadcrumb__step"
              onClick={() => i < path.length-1 && onNavigate(step.id)}>
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </button>
            {i < path.length-1 && <span className="mag-breadcrumb__sep">›</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="mag-breadcrumb__actions">
        <button className={`mag-breadcrumb__bookmark ${isBookmarked?'is-active':''}`}
          onClick={onBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}>
          {isBookmarked ? '🔖' : '🏷'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FLOATING NAV BUTTON (always accessible)
// ─────────────────────────────────────────────────────────
function FloatingNavButton({ onClick, hasRecent }) {
  return (
    <button className="floating-nav-btn" onClick={onClick} title="Jump / Search / Recent">
      <span className="floating-nav-btn__icon">⌕</span>
      <span className="floating-nav-btn__label">Navigate</span>
      {hasRecent && <div className="floating-nav-btn__pulse" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// MASTER NAVIGATION PROVIDER
// Export this and wrap your app with it
// ─────────────────────────────────────────────────────────
export function MagazineNavSystem({ children, currentSection, onNavigate }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showRail, setShowRail] = useState(false);
  const { history, bookmarks, pushPage, toggleBookmark, isBookmarked } = usePageMemory(20);

  // Global keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleNavigate = (sectionId, subId) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (section) {
      pushPage({ ...section, sectionId, subId, title: section.label });
    }
    onNavigate?.(sectionId, subId);
  };

  const currentPage = SECTIONS.find(s => s.id === currentSection);
  const breadcrumbPath = currentPage ? [
    { id:'home', icon:'🏠', label:'TMI' },
    { id: currentPage.id, icon: currentPage.icon, label: currentPage.label },
  ] : [{ id:'home', icon:'🏠', label:'TMI' }];

  return (
    <div className="tmi-nav-system">
      {/* ── TOP JUMP BAR ── */}
      <JumpBar
        onOpenPalette={() => setCmdOpen(true)}
        onNavigate={handleNavigate}
        currentSection={currentSection}
        recentCount={history.length}
      />

      {/* ── BREADCRUMB ── */}
      <MagazineBreadcrumb
        path={breadcrumbPath}
        onNavigate={handleNavigate}
        onBookmark={() => currentPage && toggleBookmark({ ...currentPage, title: currentPage.label })}
        isBookmarked={currentPage ? isBookmarked(currentPage.id) : false}
      />

      {/* ── PAGE CONTENT ── */}
      <div className="tmi-nav-system__content">{children}</div>

      {/* ── RECENTLY VIEWED RAIL ── */}
      {showRail && (
        <RecentlyViewedRail
          history={history}
          onNavigate={handleNavigate}
          onClose={() => setShowRail(false)}
        />
      )}

      {/* ── FLOATING NAV BUTTON (mobile) ── */}
      <FloatingNavButton onClick={() => setCmdOpen(true)} hasRecent={history.length > 0} />

      {/* ── COMMAND PALETTE ── */}
      {cmdOpen && (
        <CommandPalette
          onClose={() => setCmdOpen(false)}
          onNavigate={handleNavigate}
          recentPages={history}
          bookmarks={bookmarks}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

// ─────────────────────────────────────────────────────────
// STANDALONE DEMO EXPORT
// ─────────────────────────────────────────────────────────
export default function MagazineNavDemo() {
  const [currentSection, setCurrentSection] = useState('home');
  const [cmdOpen, setCmdOpen] = useState(false);
  const { history, bookmarks, pushPage, toggleBookmark, isBookmarked } = usePageMemory(20);

  const handleNavigate = (sectionId) => {
    const section = SECTIONS.find(s => s.id===sectionId);
    if (section) pushPage({ ...section, sectionId, title:section.label });
    setCurrentSection(sectionId);
  };

  const current = SECTIONS.find(s => s.id===currentSection);

  return (
    <div className="nav-demo">
      <JumpBar
        onOpenPalette={() => setCmdOpen(true)}
        onNavigate={handleNavigate}
        currentSection={currentSection}
        recentCount={history.length}
      />

      <MagazineBreadcrumb
        path={[{id:'home',icon:'🏠',label:'TMI'}, ...(current?[{id:current.id,icon:current.icon,label:current.label}]:[])]}
        onNavigate={handleNavigate}
        onBookmark={() => current && toggleBookmark({...current,title:current.label})}
        isBookmarked={current ? isBookmarked(current.id) : false}
      />

      {/* Current section display */}
      <div className="nav-demo__current">
        <div className="nav-demo__current-icon">{current?.icon || '🏠'}</div>
        <div className="nav-demo__current-name">{current?.label || 'Home'}</div>
        <div className="nav-demo__current-tip">
          Press <kbd>⌘K</kbd> or click the search bar to jump anywhere
        </div>
      </div>

      <RecentlyViewedRail history={history} onNavigate={handleNavigate} />
      <FloatingNavButton onClick={() => setCmdOpen(true)} hasRecent={history.length>0} />

      {cmdOpen && (
        <CommandPalette
          onClose={() => setCmdOpen(false)}
          onNavigate={(id) => { handleNavigate(id); setCmdOpen(false); }}
          recentPages={history}
          bookmarks={bookmarks}
        />
      )}
    </div>
  );
}
