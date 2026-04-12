import { type NextRequest, NextResponse } from "next/server";

async function loadJson(req: NextRequest, path: string): Promise<any> {
  const url = new URL(path, req.nextUrl.origin);
  const res = await fetch(url.toString(), {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return res.json();
}

async function loadJsonSafe(req: NextRequest, path: string): Promise<any> {
  try {
    return await loadJson(req, path);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const [coverData, newsData, interviewsData, featuredData] = await Promise.all([
      loadJson(req, "/api/homepage/belt-feed?belt=cover&limit=4"),
      loadJson(req, "/api/homepage/belt-feed?belt=news&limit=12"),
      loadJson(req, "/api/homepage/belt-feed?belt=interviews&limit=6"),
      loadJsonSafe(req, "/api/homepage/featured-artist"),
    ]);

    const cover = Array.isArray(coverData) ? coverData : [];
    const news = Array.isArray(newsData) ? newsData : [];
    const interviews = Array.isArray(interviewsData) ? interviewsData : [];

    return NextResponse.json({
      cover,
      news,
      interviews,
      featuredArtist: featuredData,
    });
  } catch {
    return NextResponse.json({
      cover: [],
      news: [],
      interviews: [],
      featuredArtist: null,
    });
  }
}
