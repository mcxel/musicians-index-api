export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "block", background: "black", color: "white" }}>
        <div style={{ padding: 20 }}>LAYOUT IS WORKING</div>
        {children}
      </body>
    </html>
  );
}
