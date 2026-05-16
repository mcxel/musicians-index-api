"use client";

type HostStatusCardProps = {
  id: string;
  name: string;
  role: string;
  currentRoute: string;
  currentTask: string;
  avatarState: string;
  voiceState: string;
  animationState: string;
  proofStatus: string;
};

export default function HostStatusCard(props: HostStatusCardProps) {
  return (
    <article data-testid={`host-status-card-${props.id}`} style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 10, background: "#0f172a", padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <strong style={{ color: "#e2e8f0", fontSize: 13 }}>{props.name}</strong>
        <span style={{ color: "#93c5fd", fontSize: 11 }}>{props.role}</span>
      </div>
      <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 6 }}>Route: {props.currentRoute}</div>
      <div style={{ fontSize: 11, color: "#cbd5e1" }}>Task: {props.currentTask}</div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
        avatar={props.avatarState} voice={props.voiceState} anim={props.animationState} proof={props.proofStatus}
      </div>
    </article>
  );
}
