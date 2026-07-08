"use client";

import React from "react";
import Link from "next/link";
import { useTmiSession } from "@/hooks/SessionContext";
import { hasPermission, TMIPermission } from "@/lib/auth/roles";

type Props = React.PropsWithChildren<{
  permission: TMIPermission | string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabledTooltip?: string;
  showWhenDisabled?: boolean; // if true, render disabled UI instead of hiding entirely
  className?: string;
  asButton?: boolean; // force rendering as button even with href
}>;

export default function TMIAction({ permission, href, onClick, children, disabledTooltip, showWhenDisabled = false, className, asButton = false }: Props) {
  const session = useTmiSession();
  const role = (session?.userRole || "MEMBER") as any;

  // roles.hasPermission expects TMIPermission union; allow string cast
  const permitted = (() => {
    try {
      return hasPermission(role, permission as any);
    } catch {
      return false;
    }
  })();

  if (!permitted && !showWhenDisabled) return null;

  const commonProps = {
    onClick: (e: any) => {
      if (!permitted) {
        e.preventDefault();
        // optionally log denied attempt
        // lightweight audit ping (non-blocking)
        void fetch('/api/admin/audit/permission-denied', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ permission, role, path: window.location.pathname }) }).catch(()=>{});
        return;
      }
      onClick?.(e);
    },
    className: className ?? undefined,
    title: (!permitted && disabledTooltip) ? disabledTooltip : undefined,
    'aria-disabled': !permitted,
  } as any;

  // prefer rendering as Link when href provided and not forced to button
  if (href && !asButton) {
    if (!permitted) {
      // render non-interactive anchor-like element for disabled state
      return (
        <a href={href} onClick={(e) => { e.preventDefault(); }} className={className} title={disabledTooltip} aria-disabled="true" style={{ opacity: 0.45, pointerEvents: 'none' }}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} {...commonProps}>
        {children}
      </Link>
    );
  }

  // fallback to button
  return (
    <button type="button" {...commonProps} disabled={!permitted} style={!permitted ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
      {children}
    </button>
  );
}
