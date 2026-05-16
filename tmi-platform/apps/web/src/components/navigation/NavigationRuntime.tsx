"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushRoute } from "@/lib/routeHistory";
import { unlockNavigation } from "@/lib/navigationLock";

export default function NavigationRuntime() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    pushRoute(pathname);
    unlockNavigation();
  }, [pathname]);

  return null;
}
