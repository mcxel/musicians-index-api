import React from "react";

export default function MagazineGrid({ children }: React.PropsWithChildren<{}>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}
