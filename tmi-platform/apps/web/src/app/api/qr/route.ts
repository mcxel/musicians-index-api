import { NextRequest, NextResponse } from "next/server";

// Proxies a Google Charts QR image and returns it as a downloadable PNG.
// The `download` attribute on <a> tags only triggers for same-origin URLs,
// so we proxy the cross-origin Google Charts image through this route.
export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  const label = req.nextUrl.searchParams.get("label") ?? "qr";

  if (!data) {
    return NextResponse.json({ error: "Missing data param" }, { status: 400 });
  }

  // Validate: only allow Google Charts QR endpoint
  const chartUrl = `https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=${encodeURIComponent(data)}&choe=UTF-8&chld=M|1`;

  const safeFilename = label
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60);

  try {
    const upstream = await fetch(chartUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "QR generation failed" },
        { status: 502 }
      );
    }
    const imageBuffer = await upstream.arrayBuffer();
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${safeFilename}-qr.png"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch QR image" },
      { status: 502 }
    );
  }
}
