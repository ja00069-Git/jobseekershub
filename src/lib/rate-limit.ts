import { NextResponse } from "next/server";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalRateLimitStore = globalThis as {
  __jobHuntRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalRateLimitStore.__jobHuntRateLimitStore ??
  (globalRateLimitStore.__jobHuntRateLimitStore = new Map<string, RateLimitEntry>());

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return null;
  }

  if (current.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
        },
      },
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return null;
}
