import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED_ROOT_PATHS = new Set([
  "create",
  "share",
  "api",
  "images",
  "music",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let root "/" pass through directly (supports /?to=... and /?name=...)
  if (pathname === "/") {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    return response;
  }

  // Split path segments and ignore reserved routes or dotfiles/assets
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length === 0 ||
    RESERVED_ROOT_PATHS.has(segments[0].toLowerCase()) ||
    segments.some((s) => s.startsWith(".") || s.includes("."))
  ) {
    return NextResponse.next();
  }

  // Rewrite clean slug URLs internally to the single "/" invitation template:
  //   /husain-amjhera       -> /?to=husain-amjhera
  //   /husain-amjhera/4     -> /?to=husain-amjhera&invitees=4
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = "/";
  rewriteUrl.searchParams.set("to", segments[0]);
  if (segments.length >= 2) {
    rewriteUrl.searchParams.set("invitees", segments[1]);
  }

  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api (API routes)
     * - images (public static images)
     * - favicon.ico, icon.svg, robots.txt, sitemap.xml
     * - any path containing a file extension (e.g. .png, .svg, .webp, .json)
     */
    "/((?!_next/static|_next/image|api|images|music|create|share|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};
