'use client';

/**
 * TMI Workspace Tab
 *
 * Tab component for Workspace Drawer navigation.
 * Grid layout: 3 columns × N rows
 *
 * Structure:
 * 🎵 PLAYLIST       📸 MEMORY      ⭐ FAVORITES
 * 📻 STREAM & WIN   📅 BOOKING     🛒 STORE
 * 💰 REVENUE        💬 MESSAGES    📊 ANALYTICS
 *
 * Each tab:
 * - Emoji + uppercase label
 * - Assigned feature color
 * - Glow on hover
 * - Smooth underline on active
 * - Scale up when active
 *
 * @example
 * <TmiWorkspaceTabs
 *   tabs={['playlist', 'memoryWall', 'messages', 'booking', 'store', 'revenue']}
 *   activeTab="playlist"
 *   onTabChange={setActiveTab}
 * />
 */

import React, { useState } from 'react';
import { getAllFeatureTokens, getFeatureToken } from '../featureTokens';
import { TMI_COLORS } from '../colors';
import { TMI_MOTION } from '../motion';
import { TmiFeatureButton } from './TmiFeatureButton';

interface TmiWorkspaceTabsProps {
  /** List of feature IDs to show as tabs */
  tabs: string[];

  /** Currently active tab ID */
  activeTab?: string;

  /** Called when user clicks a tab */
  onTabChange?: (tabId: string) => void;

  /** Custom styling */
  style?: React.CSSProperties;

  /** Grid columns (default: 3) */
  columns?: number;
}

/**
 * Workspace Tab Bar
 * Renders a grid of feature buttons
 */
export function TmiWorkspaceTabs({
  tabs,
  activeTab,
  onTabChange,
  style,
  columns = 3,
}: TmiWorkspaceTabsProps) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '8px',
    padding: '12px',
    background: 'rgba(10, 6, 20, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '8px',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    ...style,
  };

  return (
    <div style={containerStyle}>
      {tabs.map((tabId) => (
        <div
          key={tabId}
          style={{
            position: 'relative',
            transition: `all ${TMI_MOTION.durations.quick}ms ${TMI_MOTION.easing.smooth}`,
          }}
        >
          <TmiFeatureButton
            feature={tabId as any}
            onClick={() => onTabChange?.(tabId)}
            size="normal"
            variant={activeTab === tabId ? 'hero' : 'default'}
            style={{
              width: '100%',
              justifyContent: 'center',
              textAlign: 'center',
            }}
            tabId={tabId}
          >
            {getFeatureToken(tabId)?.name || 'UNKNOWN'}
          </TmiFeatureButton>

          {/* Active underline */}
          {activeTab === tabId && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: '8px',
                right: '8px',
                height: '3px',
                background: `linear-gradient(90deg, ${getFeatureToken(tabId)?.color.primary}, ${getFeatureToken(tabId)?.color.primary}88)`,
                borderRadius: '2px',
                boxShadow: `0 0 10px ${getFeatureToken(tabId)?.color.primary}`,
                animation: `slideUp ${TMI_MOTION.durations.normal}ms ${TMI_MOTION.easing.snappy}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface TmiSingleWorkspaceTabProps {
  /** Feature ID */
  feature: string;

  /** Is this tab active */
  isActive?: boolean;

  /** Tab clicked handler */
  onClick?: () => void;

  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Single Workspace Tab
 * Used for standalone or inline tab placement
 */
export function TmiSingleWorkspaceTab({
  feature,
  isActive = false,
  onClick,
  style,
}: TmiSingleWorkspaceTabProps) {
  const token = getFeatureToken(feature);
  if (!token) return null;

  const [isHovered, setIsHovered] = useState(false);

  const tabStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: `all ${TMI_MOTION.durations.quick}ms ${TMI_MOTION.easing.smooth}`,
    color: isActive ? token.color.primary : '#aaaaaa',
    textShadow: isActive ? token.glow.textGlowNormal : 'none',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    userSelect: 'none',
    background: isHovered
      ? `rgba(${token.color.rgb}, 0.1)`
      : isActive
        ? `rgba(${token.color.rgb}, 0.08)`
        : 'transparent',
    boxShadow: isActive
      ? `0 0 15px ${token.color.primary}66`
      : isHovered
        ? `0 0 10px ${token.color.primary}44`
        : 'none',
    ...style,
  };

  return (
    <div
      style={tabStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
    >
      {/* Icon */}
      <span style={{ fontSize: '1.5em' }}>{token.icon}</span>

      {/* Label */}
      <span>{token.name}</span>

      {/* Active indicator */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            width: '20px',
            height: '2px',
            background: token.color.primary,
            borderRadius: '1px',
            boxShadow: `0 0 8px ${token.color.primary}`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Full Workspace Tab Grid
 * Shows all available features in a grid layout
 */
export function TmiWorkspaceTabGrid({
  activeTab,
  onTabChange,
  style,
}: {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  style?: React.CSSProperties;
}) {
  const allTokens = getAllFeatureTokens();
  const tabIds = allTokens.map((t) => t.id);

  return (
    <TmiWorkspaceTabs
      tabs={tabIds}
      activeTab={activeTab}
      onTabChange={onTabChange}
      style={style}
      columns={3}
    />
  );
}

export default TmiWorkspaceTabs;
