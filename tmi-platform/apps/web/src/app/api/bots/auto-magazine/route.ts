import { NextResponse } from "next/server";

const MAGAZINE_TEMPLATES = [
  {
    templateId: "artist-spotlight",
    title: "Artist Spotlight: {artistName}",
    category: "artist",
    sections: ["intro", "discography", "upcoming_events", "fan_message"],
  },
  {
    templateId: "beat-review",
    title: "Beat Review: {trackTitle}",
    category: "music",
    sections: ["overview", "production_notes", "rating", "where_to_buy"],
  },
  {
    templateId: "scene-report",
    title: "Scene Report: {city} Underground",
    category: "news",
    sections: ["headline", "featured_artists", "venue_spotlight", "upcoming"],
  },
  {
    templateId: "cypher-recap",
    title: "Cypher Recap — {date}",
    category: "events",
    sections: ["winner", "highlights", "stats", "next_cypher"],
  },
];

interface AutoMagazineJob {
  jobId: string;
  templateId: string;
  variables: Record<string, string>;
  status: "queued" | "generating" | "published" | "failed";
  slug?: string;
  createdAt: string;
  estimatedReady: string;
}

const jobs = new Map<string, AutoMagazineJob>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  let all = [...jobs.values()];
  if (status) all = all.filter(j => j.status === status);
  return NextResponse.json({ jobs: all, templates: MAGAZINE_TEMPLATES });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      templateId: string;
      variables?: Record<string, string>;
      publishImmediately?: boolean;
    };

    const { templateId, variables = {} } = body;
    if (!templateId) return NextResponse.json({ error: "templateId required" }, { status: 400 });

    const template = MAGAZINE_TEMPLATES.find(t => t.templateId === templateId);
    if (!template) {
      return NextResponse.json({
        error: `Unknown templateId. Available: ${MAGAZINE_TEMPLATES.map(t => t.templateId).join(", ")}`,
      }, { status: 404 });
    }

    const slug = `${templateId}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const job: AutoMagazineJob = {
      jobId: `mag_${Date.now()}`,
      templateId,
      variables,
      status: body.publishImmediately ? "published" : "queued",
      slug,
      createdAt: new Date().toISOString(),
      estimatedReady: new Date(Date.now() + 30_000).toISOString(),
    };

    jobs.set(job.jobId, job);

    return NextResponse.json({
      success: true,
      job,
      previewUrl: `/magazine/auto/${slug}`,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
