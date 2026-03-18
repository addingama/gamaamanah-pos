import { NextResponse, type NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminToken } from "@/lib/auth-edge";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login" || pathname === "/admin/logout") return NextResponse.next();

  const token = req.cookies.get(getAdminCookieName())?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
