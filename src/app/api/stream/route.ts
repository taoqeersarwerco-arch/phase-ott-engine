import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Serverless HTTP 206 Partial Content & Direct Download Relay
 * Ensures CORS headers, follows Archive.org/CDN redirects, forwards `Range: bytes=...` headers
 * for instant timeline scrubbing, and supports `?download=1` for native browser file downloads.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "phase-stream.mp4";
  const isDownload = searchParams.get("download") === "1";

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing ?url= parameter" }, { status: 400 });
  }

  try {
    const rangeHeader = req.headers.get("range");
    const upstreamHeaders: HeadersInit = {
      "User-Agent": "Phase-OTT-Engine/2.0"
    };
    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: upstreamHeaders,
      redirect: "follow"
    });

    const responseHeaders = new Headers();
    const contentType = upstreamRes.headers.get("content-type") || "video/mp4";
    const contentLength = upstreamRes.headers.get("content-length");
    const contentRange = upstreamRes.headers.get("content-range");

    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    if (contentLength) responseHeaders.set("Content-Length", contentLength);
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    if (isDownload) {
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      responseHeaders.set("Content-Disposition", `attachment; filename="${safeName}"`);
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to proxy media stream", details: err?.message },
      { status: 502 }
    );
  }
}
