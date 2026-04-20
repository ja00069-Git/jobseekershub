import { NextResponse } from "next/server";

function normalizeCallbackUrl(rawCallbackUrl: string | null, request: Request) {
  if (!rawCallbackUrl) {
    return "/";
  }

  try {
    const parsedUrl = new URL(rawCallbackUrl, request.url);
    const requestOrigin = new URL(request.url).origin;

    if (parsedUrl.origin !== requestOrigin) {
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

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const callbackUrl = normalizeCallbackUrl(
    requestUrl.searchParams.get("callbackUrl"),
    request,
  );
  const authUrl = new URL("/auth", request.url);

  if (callbackUrl !== "/") {
    authUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  return NextResponse.redirect(authUrl);
}
