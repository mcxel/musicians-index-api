import Link from "next/link";

export interface DashboardAction {
  id: string;
  label: string;
  route: string;
  icon?: string;
  accentColor?: string;
  variant?: "primary" | "outline" | "ghost";
}

interface DashboardActionRailProps {
  actions: DashboardAction[];
  accentColor?: string;
  title?: string;
}

export default function DashboardActionRail({
  actions,
  accentColor = "#00FFFF",
  title,
}: DashboardActionRailProps) {
  return (
    <div>
      {title && (
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: accentColor,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          {title.toUpperCase()}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {actions.map((action) => {
          const color = action.accentColor ?? accentColor;
          const isPrimary = action.variant === "primary";
          return (
            <Link
              key={action.id}
              href={action.route}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: 9,
                textDecoration: "none",
                border: isPrimary ? "none" : `1px solid ${color}33`,
                background: isPrimary ? color : "rgba(255,255,255,0.03)",
                color: isPrimary ? "#000" : color,
                transition: "opacity 0.15s",
              }}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
