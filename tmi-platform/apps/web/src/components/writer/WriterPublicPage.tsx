"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import WriterWall from "@/components/writer/WriterWall";
import PublicPagePublishedView from "@/components/profile/PublicPagePublishedView";
import type { DocumentPreviewPresentation } from "@/lib/publicPage/presentPublicPageDocument";
import { resolveViewMyPage } from "@/lib/identity/PublicProfileRuntime";
import { getPublicItems } from "@/lib/writer/WriterWallEngine";

export default function WriterPublicPage({
  slug,
  displayName,
  userId,
  isOwner = false,
  publishedPresentation,
}: {
  slug: string;
  displayName: string;
  userId?: string;
  isOwner?: boolean;
  publishedPresentation?: DocumentPreviewPresentation | null;
}) {
  const ownerNav = resolveViewMyPage({ role: "WRITER", userId, username: slug });

  return (
    <main
      data-testid="writer-public-page"
      data-persona="writer"
      style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 20px 80px" }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "#A3E635", fontWeight: 800 }}>WRITER BOARD</div>
        <h1 style={{ margin: "8px 0 6px", fontSize: 32, fontWeight: 900 }}>{displayName}</h1>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
          Published writing, interviews, and magazine contributions.
        </p>

        {isOwner ? (
          <div data-testid="writer-owner-shortcuts" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <Link href={ownerNav.articlesPath ?? "/hub/writer/articles"} style={chip("#A3E635")}>
              WRITE A STORY
            </Link>
            <Link href={ownerNav.articlesPath ?? "/hub/writer/articles"} style={chip("#00FFFF")}>
              YOUR ARTICLES
            </Link>
            <Link href={ownerNav.editorPath} style={chip("#FFD700")}>
              MY PAGE EDITOR
            </Link>
            <Link href={ownerNav.interviewLabPath ?? "/hub/writer/interview"} style={chip("#FF2DAA")}>
              INTERVIEW LAB
            </Link>
          </div>
        ) : null}

        {publishedPresentation ? (
          <div data-testid="writer-published-document" style={{ marginBottom: 28 }}>
            <PublicPagePublishedView presentation={publishedPresentation} />
          </div>
        ) : (
          <div
            data-testid="writer-board-empty-layout"
            style={{
              marginBottom: 28,
              padding: 18,
              border: "1px solid rgba(163,230,53,0.25)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.45)",
              fontSize: 13,
            }}
          >
            This Writer board has no published page layout yet. Published articles still appear below when they exist.
          </div>
        )}

        <WriterWall writerId={userId ?? slug} items={getPublicItems(userId ?? slug)} />
      </div>
    </main>
  );
}

function chip(color: string): CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}14`,
    color,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textDecoration: "none",
  };
}
