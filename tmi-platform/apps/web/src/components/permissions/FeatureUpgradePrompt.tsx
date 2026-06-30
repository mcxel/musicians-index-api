'use client';

/**
 * FeatureUpgradePrompt.tsx
 *
 * Modal/inline prompt shown when user tries to access premium feature
 * Locked by Marcel Dickels, 2026-06-29
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTierPermission } from '@/lib/permissions/useTierPermission';
import type { Feature } from '@/lib/permissions/TierPermissionEngine';

interface FeatureUpgradePromptProps {
  feature: Feature;
  children?: React.ReactNode;
  onAccess?: () => void;
  fallback?: React.ReactNode;
}

/**
 * Component that shows a feature if user has access, otherwise shows upgrade prompt
 */
export function FeatureGate({ feature, children, onAccess, fallback }: FeatureUpgradePromptProps) {
  const permission = useTierPermission(feature);

  if (permission.hasAccess) {
    return <>{onAccess?.(), children}</>;
  }

  return fallback ? <>{fallback}</> : <UpgradePrompt upgrade={permission.upgradeMessage} />;
}

interface UpgradePromptProps {
  upgrade: { tier: string; price: number; message: string } | null;
}

/**
 * Standalone upgrade prompt
 */
function UpgradePrompt({ upgrade }: UpgradePromptProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  if (!upgrade) return null;

  const priceDisplay = upgrade.price === 0 ? 'Free' : `$${(upgrade.price / 100).toFixed(2)}`;

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-w-sm rounded-lg border border-cyan-400/30 bg-gray-900 p-8 text-center">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Message */}
        <p className="mb-6 text-lg font-semibold text-white">{upgrade.message}</p>

        {/* CTA */}
        <button
          onClick={() => {
            router.push(`/upgrade?tier=${upgrade.tier}`);
          }}
          className="mb-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-3 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50"
        >
          Upgrade Now — {priceDisplay}/month
        </button>

        {/* See all plans link */}
        <button
          onClick={() => {
            router.push('/upgrade');
          }}
          className="w-full text-sm text-cyan-400 hover:text-cyan-300"
        >
          See All Plans
        </button>
      </div>
    </div>
  ) : null;
}
