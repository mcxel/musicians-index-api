'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getRecentPages,
  recordRecentPage,
  type PageKind,
  type RecentPageEntry,
} from '@/systems/magazine';

type NavSection = {
  id: string;
  label: string;
  icon: string;
  path?: string;
  group: 'discover' | 'read' | 'live' | 'money' | 'lifestyle' | 'account' | 'admin';
};

type MemoryItem = {
  id: string;
  label: string;
  path: string;
  visitedAt: number;
  kind: PageKind;
};

const SECTIONS: NavSection[] = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/', group: 'discover' },
  { id: 'artists', label: 'Artists', icon: '🎤', path: '/?section=artists', group: 'discover' },
  { id: 'articles', label: 'Articles', icon: '📰', path: '/articles', group: 'read' },
  { id: 'billboard', label: 'Billboard', icon: '🏆', path: '/?section=billboard', group: 'read' },
  { id: 'live', label: 'Live Rooms', icon: '🔴', path: '/room/bar-stage', group: 'live' },
  { id: 'shows', label: 'Shows', icon: '🎪', path: '/hub', group: 'live' },
  { id: 'games', label: 'Games', icon: '🎮', path: '/contest', group: 'live' },
  { id: 'contests', label: 'Contests', icon: '🏅', path: '/contest', group: 'live' },
  { id: 'sponsors', label: 'Sponsors', icon: '💼', path: '/?section=sponsors', group: 'money' },
  { id: 'store', label: 'Store', icon: '🛍️', path: '/billing', group: 'money' },
  { id: 'horoscope', label: 'Horoscope', icon: '✦', path: '/?section=horoscope', group: 'lifestyle' },
  { id: 'throwback', label: 'Throwback', icon: '📼', path: '/?section=throwback', group: 'lifestyle' },
  { id: 'seasonal', label: 'Seasonal', icon: '🌸', path: '/?section=seasonal', group: 'lifestyle' },
  { id: 'dashboard', label: 'Dashboard', icon: '🧭', path: '/dashboard', group: 'account' },
  { id: 'submit', label: 'Submit', icon: '📤', path: '/submit', group: 'account' },
  { id: 'admin', label: 'Admin', icon: '🛡️', path: '/admin', group: 'admin' },
];

const RECENT_KEY = 'tmi.nav.recent';
const BOOKMARKS_KEY = 'tmi.nav.bookmarks';

function handleStorageError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'storage_error';
}

function readMemory(key: string): MemoryItem[] {
  try {
    const raw = globalThis.sessionStorage.getItem(key) ?? globalThis.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<MemoryItem>>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Partial<MemoryItem> & { id: string; label: string; path: string; visitedAt: number } => {
        return !!item?.id && !!item?.label && !!item?.path && typeof item?.visitedAt === 'number';
      })
      .map((item) => ({
        id: item.id,
        label: item.label,
        path: item.path,
        visitedAt: item.visitedAt,
        kind: item.kind ?? inferPageKind(item.path),
      }));
  } catch {
    return [];
  }
}

function inferPageKind(path: string): PageKind {
  if (path.startsWith('/articles')) return 'article';
  if (path.startsWith('/artists') || path.includes('section=artists')) return 'artist';
  return 'random';
}

function toRecentPageEntry(item: MemoryItem): RecentPageEntry {
  return {
    id: item.id,
    route: item.path,
    title: item.label,
    kind: item.kind,
    visitedAt: item.visitedAt,
  };
}

function toMemoryItem(entry: RecentPageEntry): MemoryItem {
  return {
    id: entry.id,
    label: entry.title,
    path: entry.route,
    visitedAt: entry.visitedAt,
    kind: entry.kind,
  };
}

function writeRecent(items: MemoryItem[]) {
  try {
    globalThis.sessionStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch (error) {
    handleStorageError(error);
  }
}

function writeBookmarks(items: MemoryItem[]) {
  try {
    globalThis.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(items));
  } catch (error) {
    handleStorageError(error);
  }
}

export function MagazineNavSystem() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<MemoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<MemoryItem[]>([]);

  useEffect(() => {
    setRecent(readMemory(RECENT_KEY));
    setBookmarks(readMemory(BOOKMARKS_KEY));
  }, []);

  useEffect(() => {
    const currentSection = SECTIONS.find((section) => section.path && (pathname === section.path || (section.path === '/' && pathname === '/')));
    const item: MemoryItem = {
      id: currentSection?.id ?? pathname,
      label: currentSection?.label ?? pathname,
      path: pathname,
      visitedAt: Date.now(),
      kind: inferPageKind(pathname),
    };

    setRecent((previous) => {
      const recentEntries = previous.map(toRecentPageEntry);
      const nextEntries = getRecentPages(
        recordRecentPage(recentEntries, {
          id: item.id,
          route: item.path,
          title: item.label,
          kind: item.kind,
        })
      );
      const next = nextEntries.map(toMemoryItem);
      writeRecent(next);
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    globalThis.addEventListener('keydown', onShortcut);
    return () => globalThis.removeEventListener('keydown', onShortcut);
  }, []);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const needle = query.trim().toLowerCase();
    return SECTIONS.filter((section) => section.label.toLowerCase().includes(needle) || section.id.includes(needle));
  }, [query]);

  const navigate = (section: NavSection | MemoryItem) => {
    const path = ('path' in section ? section.path : '/') || '/';
    router.push(path);
    setOpen(false);
    setQuery('');
  };

  const toggleBookmark = () => {
    const existing = bookmarks.find((bookmark) => bookmark.path === pathname);
    if (existing) {
      const next = bookmarks.filter((bookmark) => bookmark.path !== pathname);
      setBookmarks(next);
      writeBookmarks(next);
      return;
    }

    const section = SECTIONS.find((entry) => entry.path && entry.path === pathname);
    const nextItem: MemoryItem = {
      id: section?.id ?? pathname,
      label: section?.label ?? pathname,
      path: pathname,
      visitedAt: Date.now(),
      kind: inferPageKind(pathname),
    };
    const next = [nextItem, ...bookmarks].slice(0, 100);
    setBookmarks(next);
    writeBookmarks(next);
  };

  const isBookmarked = bookmarks.some((bookmark) => bookmark.path === pathname);

  return (
    <>
      <div className="tmi-jumpbar">
        <button className="tmi-search-trigger" onClick={() => setOpen(true)}>
          <span>⌕ Search / Jump</span>
          <span>Ctrl/Cmd + K</span>
        </button>
        <div className="tmi-hot-sections">
          {SECTIONS.filter((section) => ['home', 'articles', 'live', 'games', 'contests', 'dashboard'].includes(section.id)).map((section) => (
            <button key={section.id} onClick={() => navigate(section)}>
              {section.icon} {section.label}
            </button>
          ))}
        </div>
        <button className="tmi-bookmark-btn" onClick={toggleBookmark}>
          {isBookmarked ? '🔖 Bookmarked' : '🏷️ Bookmark'}
        </button>
      </div>

      <div className="tmi-recent-rail">
        <span>Recent</span>
        {recent.slice(0, 10).map((item) => (
          <button key={`${item.id}-${item.visitedAt}`} onClick={() => navigate(item)} title={item.path}>
            {item.label}
          </button>
        ))}
      </div>

      {open ? (
        <dialog
          className="tmi-command-overlay"
          open
        >
          <div className="tmi-command-panel">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to game, article, show, contest, sponsor, billboard..."
              autoFocus
            />
            <div className="tmi-command-section">
              <h4>Sections</h4>
              <div className="tmi-command-grid">
                {filteredSections.map((section) => (
                  <button key={section.id} onClick={() => navigate(section)}>
                    <strong>{section.icon} {section.label}</strong>
                    <small>{section.group}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="tmi-command-section two-col">
              <div>
                <h4>Recent 20</h4>
                {recent.length === 0 ? <p>No pages yet.</p> : recent.slice(0, 20).map((item) => (
                  <button key={`r-${item.id}-${item.visitedAt}`} onClick={() => navigate(item)}>{item.label}</button>
                ))}
              </div>
              <div>
                <h4>Bookmarks</h4>
                {bookmarks.length === 0 ? <p>No bookmarks yet.</p> : bookmarks.map((item) => (
                  <button key={`b-${item.id}-${item.visitedAt}`} onClick={() => navigate(item)}>{item.label}</button>
                ))}
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
