"use client";
export default function FooterHUD() {
  return (
    <footer style={{ borderTop: "2px solid #333", padding: 10, textAlign: "center" }}>
      &copy; {new Date().getFullYear()} TMI Platform. All rights reserved.
    </footer>
  );
}
