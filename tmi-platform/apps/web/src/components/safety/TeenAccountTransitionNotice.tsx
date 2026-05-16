"use client";

import { getTeenTransition, type TeenTransitionRecord } from "@/lib/safety/AgeTransitionEngine";

type TeenAccountTransitionNoticeProps = {
  userId: string;
};

function getLabel(record: TeenTransitionRecord | null): string {
  if (!record) return "No transition needed.";
  if (record.status === "pending_review") return "Account is pending age transition review.";
  if (record.status === "eligible_to_transition") return "Account is eligible for adult transition.";
  if (record.status === "transitioned") return "Account has transitioned to adult mode.";
  return "No transition needed.";
}

export default function TeenAccountTransitionNotice({ userId }: TeenAccountTransitionNoticeProps) {
  const record = getTeenTransition(userId);
  const label = getLabel(record);

  return (
    <section style={{ border: "1px solid rgba(234,179,8,0.45)", borderRadius: 12, padding: 12, background: "rgba(120,53,15,0.12)" }}>
      <h3 style={{ marginTop: 0, fontSize: 13, color: "#fde68a" }}>Teen Account Transition</h3>
      <p style={{ margin: 0, fontSize: 11, color: "#fef3c7" }}>{label}</p>
    </section>
  );
}
