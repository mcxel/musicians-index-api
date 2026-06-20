'use client';

/**
 * SidePanelTabs — the collapsible tabbed side panel from Home 1's
 * "Cinematic 3-Rail Grid" (Home1CoverPage.tsx LEFT PANEL / RIGHT PANEL),
 * extracted into a reusable shell so the same look (glowing border, collapse
 * toggle strip, animated tab switching) can drop into other surfaces —
 * starting with Fan Hub / Performer Hub — instead of being redrawn from
 * scratch or copy-pasted (locked 2026-06-19 by Marcel Dickens: "we need
 * those [Home 1] panels inside of our performer and fan profiles").
 *
 * This is the VISUAL SHELL only — callers supply their own tabs/content.
 */

import { useState, type ReactNode } from 'react';

export interface SidePanelTab {
  label: string;
  icon?: string;
  content: ReactNode;
}

interface SidePanelTabsProps {
  side: 'left' | 'right';
  accentColor: string;
  tabs: SidePanelTab[];
  /** Controlled open state. Omit to manage internally (defaults open). */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  width?: string;
  minHeight?: number;
}

export default function SidePanelTabs({
  side,
  accentColor,
  tabs,
  open: openProp,
  onToggle,
  width = 'clamp(140px, 18vw, 220px)',
  minHeight = 320,
}: SidePanelTabsProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onToggle?.(next);
  };

  const isLeft = side === 'left';
  const toggleStrip = (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: `${accentColor}2e`,
        border: `1px solid ${accentColor}66`,
        borderRadius: isLeft ? (open ? '0 5px 5px 0' : '5px') : (open ? '5px 0 0 5px' : '5px'),
        width: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        writingMode: 'vertical-lr',
        fontSize: 7,
        fontWeight: 800,
        color: accentColor,
        letterSpacing: '0.1em',
        userSelect: 'none',
        flexShrink: 0,
        transform: isLeft ? undefined : 'rotate(180deg)',
      }}
    >
      {open ? '◂ PANEL' : 'PANEL ▸'}
    </div>
  );

  const panelBody = (
    <div style={{ width: open ? width : 0, overflow: 'hidden', transition: 'width 0.3s ease', flexShrink: 0 }}>
      <div
        style={{
          background: 'rgba(6,2,26,0.95)',
          border: `1px solid ${accentColor}59`,
          borderRadius: isLeft ? '8px 0 0 8px' : '0 8px 8px 0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight,
        }}
      >
        <div style={{ display: 'flex', gap: 2, padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                fontSize: 7,
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: 4,
                padding: '3px 4px',
                border: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: activeTab === i ? `${accentColor}40` : 'rgba(255,255,255,0.06)',
                color: activeTab === i ? accentColor : 'rgba(255,255,255,0.4)',
                fontFamily: "'Inter',sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon ? `${tab.icon} ` : ''}{tab.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px 6px', fontSize: 9 }}>
          {tabs[activeTab]?.content}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', paddingTop: 8 }}>
      {isLeft ? (<>{panelBody}{toggleStrip}</>) : (<>{toggleStrip}{panelBody}</>)}
    </div>
  );
}
