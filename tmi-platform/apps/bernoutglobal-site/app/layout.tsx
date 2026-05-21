import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | BerntoutGlobal", default: "BerntoutGlobal" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050508", color: "#f0f0f0" }}>{children}</body>
    </html>
  );
}
