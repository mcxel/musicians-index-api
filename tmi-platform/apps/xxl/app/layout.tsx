import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | BerntoutGlobal XXL", default: "BerntoutGlobal XXL" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "monospace" }}>
        {children}
      </body>
    </html>
  );
}
