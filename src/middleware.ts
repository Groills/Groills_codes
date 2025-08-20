import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/verify"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  const isPublicPath =
    PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/verify/"); // ✅ match dynamic /verify/:username

  if (token) {
    // If logged in and visiting /sign-in or /sign-up → redirect to dashboard
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // ✅ Allow logged-in users to visit "/" (landing page)
    return NextResponse.next();
  }

  // If not logged in and visiting a public path → allow
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If not logged in and visiting a private path → redirect to /sign-in
  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/video-meet/:path*",
    "/user/messages",
    "/user/videos",
  ],
};
