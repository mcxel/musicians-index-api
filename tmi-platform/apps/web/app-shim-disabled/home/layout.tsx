import Link from "next/link";

const HOME_LINKS = [
  { href: "/home/1", label: "Home 1" },
  { href: "/home/1-2", label: "Home 1-2" },
  { href: "/home/2", label: "Home 2" },
  { href: "/home/3", label: "Home 3" },
  { href: "/home/4", label: "Home 4" },
  { href: "/home/5", label: "Home 5" },
  { href: "/messages", label: "Messages" },
  { href: "/platform-status", label: "Status" },
];

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav
        aria-label="Homepage jump navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 59,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          whiteSpace: "nowrap",
          padding: "8px 12px",
          background: "rgba(10, 6, 25, 0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {HOME_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "5px 12px",
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ paddingTop: 48 }}>{children}</div>
    </>
  );
}
