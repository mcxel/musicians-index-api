"use client";
export default function HUDFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "2px solid cyan", padding: 20 }}>
      {children}
    </div>
  );
}
