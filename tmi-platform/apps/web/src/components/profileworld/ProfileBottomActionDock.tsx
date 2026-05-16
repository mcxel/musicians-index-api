"use client";

type ProfileBottomActionDockProps = {
  onAction: (action: string) => void;
};

const ACTIONS = ["run ad", "boost budget", "target audience", "choose placement", "auto optimize", "deep analytics"];

export default function ProfileBottomActionDock({ onAction }: ProfileBottomActionDockProps) {
  return (
    <div style={{ borderRadius: 14, border: "1px solid rgba(255,120,45,0.34)", background: "rgba(5,12,28,0.92)", padding: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        {ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(255,120,45,0.46)",
              background: "rgba(255,120,45,0.14)",
              color: "#ffd8b3",
              padding: "8px 10px",
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: 10,
              letterSpacing: "0.08em",
              fontWeight: 800,
            }}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
