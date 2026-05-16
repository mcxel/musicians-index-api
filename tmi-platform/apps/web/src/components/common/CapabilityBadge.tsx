import type { ComponentCapability } from "@/lib/capabilities/componentCapabilityRegistry";

interface CapabilityBadgeProps {
  capability: ComponentCapability;
  compact?: boolean;
}

export default function CapabilityBadge({ capability, compact = false }: CapabilityBadgeProps) {
  return (
    <div
      data-testid={`capability-badge-${capability.id}`}
      aria-label={`Capability metadata for ${capability.id}`}
      style={{
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 8,
        padding: compact ? "4px 8px" : "8px 10px",
        fontSize: compact ? 10 : 11,
        background: "rgba(15,23,42,0.66)",
        color: "#cbd5e1",
      }}
    >
      <strong style={{ color: "#67e8f9", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: compact ? 9 : 10 }}>
        Capability
      </strong>
      <div style={{ marginTop: 2 }}>{capability.id}</div>
      <div style={{ color: "#94a3b8", marginTop: 2 }}>{capability.action}</div>
      <div style={{ color: "#a5f3fc", marginTop: 2 }}>
        route {capability.route} {"->"} fallback {capability.fallbackRoute}
      </div>
    </div>
  );
}
