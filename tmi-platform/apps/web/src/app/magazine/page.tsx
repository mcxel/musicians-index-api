import Link from "next/link";

export const metadata = {
  title: "The Musician's Index Magazine",
  description:
    "Welcome to The Musician's Index Magazine — articles, featured performers, news, interviews, and more.",
};

const articles = [
  {
    slug: "artist-spotlight-1",
    title: "Artist Spotlight: The Rising Star",
    summary: "A deep dive into the journey of a breakout artist.",
    date: "2026-03-29",
    author: "Editor Team",
  },
  {
    slug: "festival-highlights-2026",
    title: "Festival Highlights 2026",
    summary: "The best moments from this year's music festivals.",
    date: "2026-03-28",
    author: "Staff Writer",
  },
];

export default function MagazinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#fff",
        padding: "0",
      }}
    >
      {/* Article Index List */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 0 0 0" }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Latest Articles</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {articles.map((article) => (
            <div
              key={article.slug}
              style={{
                background: "#050505",
                color: "white",
                border: "1px solid cyan",
                borderRadius: 8,
                padding: 24,
              }}
            >
              <h3 style={{ margin: 0 }}>
                <Link href={`/magazine/article/${article.slug}`}>{article.title}</Link>
              </h3>
              <div style={{ fontSize: 14, color: "#0ff", marginBottom: 8 }}>
                {article.date} • {article.author}
              </div>
              <p style={{ margin: 0 }}>{article.summary}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Magazine Entry Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 40px 48px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#ff6b35",
            marginBottom: "16px",
          }}
        >
          BerntoutGlobal XXL Presents
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          Welcome to{" "}
          <span style={{ color: "#ff6b35" }}>
            The Musician&apos;s Index Magazine
          </span>
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "rgba(255,255,255,0.6)",
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          The home of featured performers, breaking news, interviews, reviews,
          and the pulse of the music world.
        </p>

        {/* Section Jump Nav */}
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          {[
            { label: "Featured", href: "#featured" },
            { label: "News", href: "#news" },
            { label: "Interviews", href: "#interviews" },
            { label: "Reviews", href: "#reviews" },
            { label: "Trending", href: "#trending" },
            { label: "Local Artists", href: "#local" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 20px",
                border: "1px solid rgba(255,107,53,0.4)",
                borderRadius: "24px",
                color: "#ff6b35",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </section>

      {/* Featured Performer Section */}
      <section
        id="featured"
        style={{
          padding: "64px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#ff6b35",
            marginBottom: "32px",
          }}
        >
          Featured Performer
        </h2>
        <div
          style={{
            background: "rgba(255,107,53,0.06)",
            border: "1px solid rgba(255,107,53,0.2)",
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Featured performer articles will appear here.
          </p>
          <Link
            href="/articles"
            style={{
              display: "inline-block",
              marginTop: "24px",
              padding: "12px 32px",
              background: "#ff6b35",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Browse All Articles
          </Link>
        </div>
      </section>

      {/* News Billboard Section */}
      <section
        id="news"
        style={{
          padding: "0 40px 64px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "32px",
          }}
        >
          News Billboard
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {["Breaking News", "Industry Update", "Artist Spotlight"].map(
            (item) => (
              <div
                key={item}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "28px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: "12px",
                  }}
                >
                  {item}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                  News articles will appear here.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Interviews Section */}
      <section
        id="interviews"
        style={{
          padding: "0 40px 64px",
          maxWidth: "1200px",
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "64px",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "32px",
          }}
        >
          Interviews
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          Interview articles will appear here.
        </p>
      </section>

      {/* Reviews Section */}
      <section
        id="reviews"
        style={{
          padding: "0 40px 64px",
          maxWidth: "1200px",
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "64px",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "32px",
          }}
        >
          Reviews
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          Review articles will appear here.
        </p>
      </section>

      {/* Trending Section */}
      <section
        id="trending"
        style={{
          padding: "0 40px 64px",
          maxWidth: "1200px",
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "64px",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "32px",
          }}
        >
          Trending
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          Trending content will appear here.
        </p>
      </section>

      {/* Local Artists Section */}
      <section
        id="local"
        style={{
          padding: "0 40px 80px",
          maxWidth: "1200px",
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "64px",
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "32px",
          }}
        >
          Local Artists
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          Local artist spotlights will appear here.
        </p>
      </section>
    </main>
  );
}
