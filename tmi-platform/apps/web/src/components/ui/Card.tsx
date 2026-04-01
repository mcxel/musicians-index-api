import React from 'react';
export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#050505",
        border: "1px solid cyan",
        padding: "20px",
        marginBottom: "20px",
        color: "white",
      }}
    >
      {children}
    </div>
  );
}
