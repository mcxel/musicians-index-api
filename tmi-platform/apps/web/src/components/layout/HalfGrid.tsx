import React from "react";

export default function HalfGrid({ children }: React.PropsWithChildren<{}>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}
