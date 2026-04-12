"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlowFrame from "@/components/home/shared/GlowFrame";
import SectionTitle from "@/components/ui/SectionTitle";
import ArticleCard from "@/components/cards/ArticleCard";
import { getHomeEditorial, type HomeEditorialArticle } from "@/components/home/data/getHomeEditorial";

export default function InterviewBelt() {
  const [interviews, setInterviews] = useState<HomeEditorialArticle[]>([]);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    getHomeEditorial()
      .then((result) => {
        setInterviews(result.data.interviews);
        setSource(result.source);
      })
      .catch(() => {});
  }, []);

  return (
    <GlowFrame accent="cyan">
      <div style={{ padding: "22px 24px" }}>
        <SectionTitle title="Interviews" accent="cyan" badge={`New · ${source === "live" ? "Live" : "Fallback"}`} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {interviews.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              category={article.category}
              author={article.authorName}
              excerpt={article.excerpt}
              href={article.slug ? `/articles/${article.slug}` : undefined}
              accent="cyan"
            />
          ))}
        </div>
        <div style={{ marginTop: 14, textAlign: "right" }}>
          <Link href="/articles" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>
            All Interviews →
          </Link>
        </div>
      </div>
    </GlowFrame>
  );
}