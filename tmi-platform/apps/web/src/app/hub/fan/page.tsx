'use client';
import { useTmiSession } from "@/hooks/SessionContext";
import FanHQShell from "@/components/fan/FanHQShell";

export default function FanHubPage() {
  const { userId, userName } = useTmiSession();
  return <FanHQShell fanId={userId} fanDisplayName={userName} />;
}
