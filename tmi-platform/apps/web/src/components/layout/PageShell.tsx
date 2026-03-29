"use client";
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20 }}>
      {children}
    </div>
  );
}
