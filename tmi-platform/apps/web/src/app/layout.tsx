import AppProviders from "@/components/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "block", background: "black", color: "white" }}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
