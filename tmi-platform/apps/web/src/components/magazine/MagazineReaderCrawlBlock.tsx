type MagazineReaderCrawlBlockProps = {
  title: string;
  deck: string;
  author: string;
  publishedAt: string;
  body: string;
};

/** Server-rendered article text for crawlers and no-JS readers. */
export default function MagazineReaderCrawlBlock({
  title,
  deck,
  author,
  publishedAt,
  body,
}: MagazineReaderCrawlBlockProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article
      aria-label={title}
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      <h1>{title}</h1>
      {deck ? <p>{deck}</p> : null}
      <p>
        By {author}
        {formattedDate ? ` · ${formattedDate}` : ""}
      </p>
      {body.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </article>
  );
}
