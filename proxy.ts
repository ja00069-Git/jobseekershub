import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = new Set(["/", "/auth", "/privacy"]);

function normalizeCallbackUrl(rawCallbackUrl: string | null, request: NextRequest) {
  if (!rawCallbackUrl) {
    return "/";
  }

  try {
    const parsedUrl = new URL(rawCallbackUrl, request.url);

    if (parsedUrl.origin !== request.nextUrl.origin) {
      return "/";
    }

    const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}`;

    if (
      normalizedPath === "/auth" ||
      normalizedPath.startsWith("/auth?") ||
      normalizedPath === "/api/auth/signin" ||
      normalizedPath.startsWith("/api/auth/signin?")
    ) {
      return "/";
    }

    return normalizedPath;
  } catch {
    return rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/";
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/api/auth/signin") {
    const authUrl = new URL("/auth", request.url);
    const callbackUrl = normalizeCallbackUrl(
      request.nextUrl.searchParams.get("callbackUrl"),
      request,
    );

    if (callbackUrl !== "/") {
      authUrl.searchParams.set("callbackUrl", callbackUrl);
    }

    return NextResponse.redirect(authUrl);
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!token) {
    const authUrl = new URL("/auth", request.url);
    const callbackUrl = normalizeCallbackUrl(`${pathname}${search}`, request);

    if (callbackUrl !== "/") {
      authUrl.searchParams.set("callbackUrl", callbackUrl);
    }

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
