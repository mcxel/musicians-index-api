import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | BerntoutGlobal LLC", default: "BerntoutGlobal LLC — Internal" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#04040a", color: "#e0e0f0", fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
