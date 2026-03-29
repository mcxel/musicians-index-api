
import ArticleHero from "@/components/magazine/ArticleHero";
import ArticleParagraph from "@/components/magazine/ArticleParagraph";
import ArticleImage from "@/components/magazine/ArticleImage";
import ArticleQuote from "@/components/magazine/ArticleQuote";
import { notFound } from "next/navigation";

const articles = [
  {
    slug: "artist-spotlight-1",
    title: "Artist Spotlight: The Rising Star",
    summary: "A deep dive into the journey of a breakout artist.",
    date: "2026-03-29",
    author: "Editor Team",
    heroImage: "https://placehold.co/800x300/111/fff?text=Hero+Image",
    content: [
      { type: "paragraph", text: "This is the story of a new artist making waves in the industry..." },
      { type: "quote", text: "Music is the language of the soul." },
      { type: "image", url: "https://placehold.co/600x300/222/fff?text=Story+Image" },
      { type: "paragraph", text: "Their journey is just beginning, but the impact is already felt." },
    ],
  },
  {
    slug: "festival-highlights-2026",
    title: "Festival Highlights 2026",
    summary: "The best moments from this year's music festivals.",
    date: "2026-03-28",
    author: "Staff Writer",
    heroImage: "https://placehold.co/800x300/111/fff?text=Festival+Hero",
    content: [
      { type: "paragraph", text: "2026 was a year of unforgettable performances..." },
      { type: "image", url: "https://placehold.co/600x300/333/fff?text=Festival+Image" },
      { type: "quote", text: "The crowd was electric!" },
    ],
  },
];

function renderContentBlock(block: any, i: number) {
  switch (block.type) {
    case "paragraph":
      return <ArticleParagraph key={i} text={block.text} />;
    case "quote":
      return <ArticleQuote key={i} text={block.text} />;
    case "image":
      return <ArticleImage key={i} />;
    default:
      return null;
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return notFound();

  return (
    <div style={{ padding: "40px", color: "white", maxWidth: "900px", margin: "0 auto" }}>
      <ArticleHero title={article.title} />
      <div style={{ color: "#aaa", marginBottom: "20px" }}>
        By {article.author} • {article.date}
      </div>
      {article.content.map((block, i) => renderContentBlock(block, i))}
    </div>
  );
}
