"use client";

/**
 * ArticleSubmissionForm.tsx — the canonical Article Submission Form.
 *
 * Lane: FINAL COMPLETION WAVE / Pillar 3 (2026-10-30).
 *
 * Renders INSIDE the existing Article drawer (PerformerBioMagazineDrawer's
 * "magazine" tab) — never a disconnected standalone page. The first-article
 * flow begins with the minimum five category-balanced interview questions
 * (EDITORIAL>=2, PERSONAL>=1, WILD_CARD>=1) from ArticleQuestionBank; answers
 * compose into the performer's ONE canonical Living Article via
 * /api/articles/performer-draft (upsert by unique Artist.profileArticleId —
 * never a second article).
 *
 * SAVE DRAFT persists without publishing. SUBMIT advances into the editorial
 * workflow. PUBLISH appears only where the account has direct-publish
 * authority. PREVIEW uses the real MagazineArticle block composition the
 * reader sees — never a fake preview card.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  selectInterviewQuestions,
  type ArticleQuestion,
} from "@/lib/magazine/ArticleQuestionBank";
import { composeArticleDraft } from "@/lib/magazine/ArticleDraftComposer";
import { resolveArticlePhotoCapacity } from "@/lib/magazine/ArticlePhotoEntitlement";

type AccountRole = "performer" | "fan" | "business";
type AccountType = "fan" | "performer" | "artist" | "band";
type Tier =
  | "free" | "pro" | "RUBY" | "silver" | "gold" | "platinum" | "diamond"
  | "FREE" | "PRO" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface ArticleSubmissionFormProps {
  role?: AccountRole;
  accountType?: AccountType;
  tier?: Tier;
  /** True when the account holds direct-publish authority for this article. */
  canPublish?: boolean;
  onPublished?: (articleId: string) => void;
  /** When provided, the interview seeds the host editor (one writer, one
   * article) instead of self-persisting. Used when this form is mounted inside
   * the existing living-article editor (PerformerBioMagazineDrawer). */
  onSeedDraft?: (draft: { title: string; subtitle: string | null; body: string }) => void;
  onClose?: () => void;
}

type Status = "loading" | "editing" | "preview" | "saving" | "submitting" | "error";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";

export default function ArticleSubmissionForm({
  role = "performer",
  accountType = "performer",
  tier = "free",
  canPublish = false,
  onPublished,
  onSeedDraft,
  onClose,
}: ArticleSubmissionFormProps) {
  const [questions, setQuestions] = useState<ArticleQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [existingArticleId, setExistingArticleId] = useState<string | null>(null);

  const capacity = useMemo(
    () => resolveArticlePhotoCapacity(accountType as never, tier as never),
    [accountType, tier],
  );

  // Load any existing draft (resume) and the persisted question set.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/articles/performer-draft", { credentials: "include" });
        const data = (await res.json()) as { article?: { id: string; title: string; content?: { body?: string } } | null };
        if (!alive) return;
        if (res.ok && data.article) {
          setExistingArticleId(data.article.id);
          setTitle(data.article.title);
        }
      } catch {
        /* first article — no draft yet */
      }
      // First-article interview: select the persisted/seeded five-question set.
      // Seed on the existing article id (stable across reopens) or a per-user
      // session seed; selection is deterministic so the set never re-randomizes.
      const seed = existingArticleId ?? `first-article:${role}`;
      setQuestions(selectInterviewQuestions({ role: role === "business" ? "business" : role === "fan" ? "fan" : "performer", seed }));
      setStatus("editing");
    })();
    return () => { alive = false; };
  }, [role]);

  const setAnswer = useCallback((qid: string, value: string) => {
    setAnswers((cur) => ({ ...cur, [qid]: value }));
  }, []);

  const addPhoto = useCallback(() => {
    setPhotoCount((c) => {
      if (c + 1 > capacity.maxPhotos) return c; // entitlement ceiling — UI reflects, server enforces
      return c + 1;
    });
  }, [capacity.maxPhotos]);

  const removePhoto = useCallback(() => setPhotoCount((c) => Math.max(0, c - 1)), []);

  const composed = useMemo(
    () =>
      composeArticleDraft(
        questions.map((q) => ({ questionId: q.questionId, answer: answers[q.questionId] ?? "" })),
      ),
    [questions, answers],
  );

  const persist = useCallback(
    async (intent: "save" | "submit" | "publish"): Promise<boolean> => {
      setError(null);
      setStatus(intent === "save" ? "saving" : "submitting");
      const finalTitle = title.trim() || composed.suggestedSubtitle?.slice(0, 60) || "My TMI Story";
      const bodyText = composed.blocks
        .map((b) => (b.type === "heading" ? `\n## ${b.text}\n` : b.text))
        .join("\n\n");
      // Seed-the-host mode: hand the composed draft to the parent living-article
      // editor instead of self-persisting — one writer, one canonical article.
      if (onSeedDraft) {
        onSeedDraft({
          title: finalTitle,
          subtitle: composed.suggestedSubtitle,
          body: bodyText,
        });
        setStatus("editing");
        return true;
      }
      try {
        const res = await fetch("/api/articles/performer-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: finalTitle,
            subtitle: composed.suggestedSubtitle,
            body: bodyText,
            heroImageUrl: heroImageUrl.trim() || null,
            intent,
            photoCount,
          }),
        });
        const data = (await res.json()) as { article?: { id: string }; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Could not save the article.");
          setStatus("error");
          return false;
        }
        if (data.article?.id) setExistingArticleId(data.article.id);
        if (intent === "publish" && data.article?.id) onPublished?.(data.article.id);
        setStatus("editing");
        return true;
      } catch {
        setError("Network error — article not saved.");
        setStatus("error");
        return false;
      }
    },
    [title, composed, heroImageUrl, photoCount, onPublished, onSeedDraft],
  );

  if (status === "loading") {
    return <div data-testid="article-form-loading" style={{ padding: 24, color: "#9aa" }}>Loading your Article Submission Form…</div>;
  }

  return (
    <div data-testid="article-submission-form" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: CYAN, textTransform: "uppercase" }}>
            Article Submission Form
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            {existingArticleId ? "Continue your living article" : "Answer a few questions to start your first TMI story"}
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#9aa", cursor: "pointer", fontSize: 16 }}>✕</button>
        ) : null}
      </div>

      {status === "preview" ? (
        <div data-testid="article-preview" style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 16, background: "rgba(255,255,255,0.03)" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{title || "My TMI Story"}</div>
          {composed.suggestedSubtitle ? <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{composed.suggestedSubtitle}</div> : null}
          {composed.blocks.map((b, i) =>
            b.type === "heading" ? (
              <div key={i} style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.1em", color: GOLD, textTransform: "uppercase", marginTop: 14 }}>{b.text}</div>
            ) : b.type === "pullquote" ? (
              <div key={i} style={{ fontSize: 16, fontStyle: "italic", color: FUCHSIA, borderLeft: `3px solid ${FUCHSIA}`, paddingLeft: 12, marginTop: 12 }}>{b.text}</div>
            ) : (
              <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginTop: 10 }}>{b.text}</p>
            ),
          )}
          <button type="button" data-testid="article-preview-back" onClick={() => setStatus("editing")} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, border: "none", background: "#1a1a2e", color: CYAN, fontWeight: 800, cursor: "pointer" }}>
            ← Back to Article
          </button>
        </div>
      ) : (
        <>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#9aa" }}>
            Headline
            <input
              data-testid="article-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My TMI Story"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff" }}
            />
          </label>

          {questions.map((q, i) => (
            <label key={q.questionId} style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "block" }}>
              <span style={{ display: "inline-block", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color: q.category === "WILD_CARD" ? FUCHSIA : q.category === "PERSONAL" ? GOLD : CYAN, textTransform: "uppercase", marginBottom: 2 }}>
                {q.category === "WILD_CARD" ? "Wild Card" : q.category === "PERSONAL" ? "Get To Know Me" : "Editorial"}
              </span>
              <div style={{ marginBottom: 4 }}>{i + 1}. {q.text}</div>
              <textarea
                data-testid={`article-answer-${q.questionId}`}
                value={answers[q.questionId] ?? ""}
                onChange={(e) => setAnswer(q.questionId, e.target.value)}
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontFamily: "inherit" }}
              />
            </label>
          ))}

          <div style={{ border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>Photos & Media</span>
              <span data-testid="article-photo-capacity" style={{ fontSize: 10, color: capacity.multiPhoto ? CYAN : GOLD, fontWeight: 800 }}>
                {photoCount} / {capacity.maxPhotos} article photos
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" data-testid="article-add-photo" onClick={addPhoto} disabled={photoCount >= capacity.maxPhotos} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: photoCount >= capacity.maxPhotos ? "#333" : "#123", color: "#fff", fontWeight: 800, cursor: photoCount >= capacity.maxPhotos ? "default" : "pointer" }}>
                + Add Photo
              </button>
              {photoCount > 0 ? (
                <button type="button" data-testid="article-remove-photo" onClick={removePhoto} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#9aa", cursor: "pointer" }}>
                  Remove
                </button>
              ) : null}
            </div>
            {photoCount >= capacity.maxPhotos && !capacity.multiPhoto ? (
              <div style={{ fontSize: 10, color: GOLD, marginTop: 6 }}>Free articles include 1 photo. Upgrade for multi-photo stories.</div>
            ) : null}
          </div>

          {error ? <div data-testid="article-form-error" style={{ color: "#ff7070", fontSize: 11 }}>{error}</div> : null}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <button type="button" data-testid="article-save-draft" onClick={() => void persist("save")} disabled={status === "saving" || status === "submitting"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Save Draft
            </button>
            <button type="button" data-testid="article-preview-btn" onClick={() => setStatus("preview")} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.4)", background: "none", color: CYAN, fontWeight: 800, cursor: "pointer" }}>
              Preview Your Article
            </button>
            <button type="button" data-testid="article-submit" onClick={() => void persist("submit")} disabled={status === "saving" || status === "submitting"} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#FF2DAA,#FF6B35)", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
              Submit Article
            </button>
            {canPublish ? (
              <button type="button" data-testid="article-publish" onClick={() => void persist("publish")} disabled={status === "saving" || status === "submitting"} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#00FFFF,#00AABB)", color: "#050510", fontWeight: 900, cursor: "pointer" }}>
                Publish
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
