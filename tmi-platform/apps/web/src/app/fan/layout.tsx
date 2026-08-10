import type { ReactNode } from "react";
import FanRouteLayoutGate from "@/components/fan/FanRouteLayoutGate";

export default function FanLayout({ children }: { children: ReactNode }) {
  return <FanRouteLayoutGate>{children}</FanRouteLayoutGate>;
}
