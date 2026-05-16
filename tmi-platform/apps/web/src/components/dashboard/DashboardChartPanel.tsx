"use client";

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface DashboardChartPanelProps {
  title: string;
  data: ChartDataPoint[];
  accentColor?: string;
  unit?: string;
  height?: number;
}

export default function DashboardChartPanel({
  title,
  data,
  accentColor = "#00FFFF",
  unit = "",
  height = 80,
}: DashboardChartPanelProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.3em",
          color: accentColor,
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        {title.toUpperCase()}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height,
        }}
      >
        {data.map((point) => {
          const fillPct = (point.value / maxVal) * 100;
          return (
            <div
              key={point.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
                {point.value}{unit}
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${fillPct}%`,
                  background: `linear-gradient(180deg, ${accentColor}, ${accentColor}44)`,
                  borderRadius: "4px 4px 2px 2px",
                  minHeight: 3,
                }}
              />
              <span
                style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
