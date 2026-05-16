"use client";

import { motion } from "framer-motion";

interface TimingItem {
  id: string;
  label: string;
  eta: string;
}

const TIMING_ITEMS: TimingItem[] = [
  { id: "battle", label: "Next Battle", eta: "04:22" },
  { id: "cypher", label: "Next Cypher", eta: "08:11" },
  { id: "dirty-dozens", label: "Dirty Dozens", eta: "Live in 32m" },
  { id: "monday-stage", label: "Monday Stage", eta: "Tomorrow 8PM" },
  { id: "contest", label: "Contest", eta: "Tonight 10:00" },
];

interface Props {
  accentColor: string;
  activeId?: string;
}

export default function Home1EventTimingStrip({ accentColor, activeId }: Props) {
  return (
    <div
      style={{
        margin: "6px 12px 8px",
        border: `1px solid ${accentColor}3d`,
        background: "rgba(5,5,16,0.78)",
        borderRadius: 10,
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        overflow: "hidden",
      }}
    >
      {TIMING_ITEMS.map((item) => {
        const isActive = item.id === activeId;
        return (
          <motion.div
            key={item.id}
            animate={isActive ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
            transition={{ duration: 1.8, repeat: isActive ? Infinity : 0 }}
            style={{
              borderRight: `1px solid ${accentColor}22`,
              padding: "7px 8px",
              background: isActive ? `${accentColor}14` : "transparent",
            }}
          >
            <div
              style={{
                fontSize: 8,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                color: "#d0d7ff",
                opacity: 0.74,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive ? accentColor : "#ffffff",
                fontWeight: 900,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.eta}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
