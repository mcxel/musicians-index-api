# SEO_AND_METADATA_SYSTEM.md
## SEO, Open Graph, and Structured Data Rules
### BerntoutGlobal XXL / The Musician's Index

---

## METADATA BY ROUTE TYPE

### Artist Profile `/artists/[slug]`
```typescript
export async function generateMetadata({ params }) {
  const artist = await getArtistProfile(params.slug);
  return {
    title: `${artist.displayName} · The Musician's Index`,
    description: `${artist.genre} · ${artist.city} · ${artist.bio.slice(0,150)}`,
    openGraph: {
      title: artist.displayName,
      description: artist.bio,
      images: [{ url: artist.bannerUrl, width: 1200, height: 630 }],
      type: 'profile',
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

### Live Room `/arena`, `/battle`, `/cypher`
- `robots: noindex` — live rooms are not indexed
- OG image: room thumbnail with LIVE badge

### Articles `/editorial/[slug]`
- Full article metadata with author, published date
- Structured data: `Article` schema.org type

### Homepage `/`
- Title: "The Musician's Index · Discover Live Music"
- Description: "Discovery-first live digital music magazine..."
- OG image: platform hero banner

---

## SITEMAP

`/sitemap.xml` must include:
- All artist profile pages
- All venue pages
- All published articles
- All event pages (upcoming only)
- All beat marketplace pages
- Static pages (features, for-artists, etc.)

NOT included (no-index):
- Live room pages
- Admin pages
- Auth pages
- User dashboard pages

---

## ROBOTS.TXT

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /arena
Disallow: /battle
Disallow: /cypher
Disallow: /backstage
Disallow: /green-room
Disallow: /api/

Sitemap: https://themusiciansindex.com/sitemap.xml
```

---

## STRUCTURED DATA (JSON-LD)

Homepage: `WebSite` + `SearchAction` (enables Google sitelinks search)
Artist profile: `MusicArtist` + `Person`
Event pages: `MusicEvent`
Article pages: `Article` + `Author`
Venue pages: `MusicVenue`
