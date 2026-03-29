import { getIronSession } from "iron-session";
import { type NextRequest, NextResponse } from "next/server";
import type { SessionData } from "./types/session/session";
import { sessionOptions } from "./types/session/session";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    res,
    sessionOptions,
  );

  const { pathname } = request.nextUrl;

  // Paths that should not be accessible when logged in
  const authPaths = [
    "/login",
    "/register",
    "/verify-login",
    "/verify-register",
  ];

  if (session.isLoggedIn) {
    if (authPaths.some((path) => pathname.startsWith(path)) || pathname === "/") {
      return NextResponse.redirect(new URL("/courses", request.url));
    }
  } else {
    // Protected paths that require login
    const protectedPaths = ["/dashboard", "/courses"]; // Add more as needed
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/login?message=auth_required", request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
