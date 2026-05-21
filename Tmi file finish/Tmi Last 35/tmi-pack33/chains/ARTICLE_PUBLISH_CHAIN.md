# ARTICLE_PUBLISH_CHAIN.md
## Every Step When an Article Gets Published
### BerntoutGlobal XXL / The Musician's Index

---

## TRIGGER: Editor clicks Publish OR article-auto-create-pipeline runs

```
Step 1: VALIDATION
  article.status = 'in_review' (if manual) OR 'auto_draft' (if pipeline)
  Checks:
    → title is set
    → body has content
    → category is assigned
    → author has valid profile
    → no DMCA flags
    → content-moderation-bot clearance

Step 2: AD SLOT ASSIGNMENT
  → article-ads.service.ts assigns zones:
      ART_INLINE_1 (after paragraph 2)
      ART_INLINE_2 (after paragraph 5, if article > 600 words)
      ART_SIDEBAR_TOP (desktop only)
      ART_ENDCAP_CTA (end of article)
      ART_STICKY_MOBILE (mobile only)
  → ad-placement-bot fills available paid slots
  → house-ad-fallback-bot fills empty slots

Step 3: STATION LINK INJECTION
  → CRITICAL: Set article.stationLink = '/stations/' + author.stationSlug
  → This appears on article page as "📻 VIEW STATION" button
  → This is non-optional — every published article has this link

Step 4: SEARCH INDEXING
  → search-index-bot indexes: title, excerpt, tags, category, authorSlug

Step 5: MAGAZINE ROTATION
  → editorial-assembly-bot adds article to rotation pool
  → Story scored by: freshness + engagement + author tier discovery weight
  → Article eligible for: magazine front, homepage editorial belt

Step 6: FOLLOWER NOTIFICATIONS
  → notification-bot fires for all followers of the author
  → notification:new → "New article from [Artist Name]"

Step 7: HOMEPAGE ELIGIBILITY
  → If article is 'featured' type: homepage-rotation-bot considers for BeltEditorial
  → If author tier >= pro: eligible for homepage feature spot

Step 8: TIMELINE UPDATE
  → timeline-bot adds "Published new article" event to author timeline

Step 9: ANALYTICS INIT
  → analytics-bot starts tracking: views, read_time, engagement, clicks
  → Article viewCount starts at 0

Article is now live at /articles/[slug]
Station link visible on article page
Search indexing complete
Magazine rotation eligible
```
