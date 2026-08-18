import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";

const publicPaths = ["/login", "/auth/login", "/auth/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookies = parse(req.headers.get("cookie") || "");
  const authUser = cookies["authUser"] || cookies["sentineliq_token"];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    if (authUser) {
      return NextResponse.redirect(new URL("/situacion", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/situacion/:path*",
    "/briefing/:path*",
    "/dossiers/:path*",
    "/narrativas/:path*",
    "/municipios/:path*",
    "/perfiles/:path*",
    "/gabinete/:path*",
    "/fuentes/:path*",
    "/ciberseguridad/:path*",
    "/reportes/:path*",
    "/admin/:path*",
  ],
};
