import Link from "next/link";
import { redirect } from "next/navigation";

import GoogleSignInButton from "@/components/google-signin-button";

export const dynamic = "force-dynamic";

function normalizeCallbackUrl(rawCallbackUrl?: string) {
  if (!rawCallbackUrl) {
    return "/";
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL;

  try {
    const parsedUrl = new URL(
      rawCallbackUrl,
      nextAuthUrl || "http://localhost:3000",
    );

    if (nextAuthUrl) {
      const baseUrl = new URL(nextAuthUrl);

      if (parsedUrl.origin !== baseUrl.origin) {
        return "/";
      }
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

export default async function AuthPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawCallbackUrl = resolvedSearchParams?.callbackUrl;
  const callbackUrl = normalizeCallbackUrl(rawCallbackUrl);

  if (rawCallbackUrl) {
    const expectedSearch = callbackUrl === "/"
      ? "/auth"
      : `/auth?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    const currentSearch = `/auth?callbackUrl=${encodeURIComponent(rawCallbackUrl)}`;

    if (currentSearch !== expectedSearch) {
      redirect(expectedSearch);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="ui-surface-card ui-animate-enter w-full max-w-[380px] overflow-hidden">
        {/* Header band */}
        <div className="border-b border-slate-100 px-7 py-6 dark:border-slate-800">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            JobHuntHQ
          </span>
          <h1 className="mt-3 text-[1.35rem] font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back.
          </h1>
          <p className="mt-2 text-[13px] leading-[1.55] text-slate-500 dark:text-slate-400">
            Sign in with Google to access your workspace — your data stays private and tied to your account.
          </p>
        </div>

        {/* Trust signals */}
        <div className="divide-y divide-slate-100 px-7 dark:divide-slate-800">
          {([
            { icon: "🔒", label: "Private by default",   sub: "Your data is never shared" },
            { icon: "⚡", label: "One-click sign-in",     sub: "No passwords to manage" },
          ] as const).map(({ icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3 py-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">{icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border-t border-slate-100 px-7 py-5 dark:border-slate-800">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            className="ui-btn-primary h-11 w-full justify-center text-[13px]"
          />
          <div className="mt-3 flex items-center justify-between">
            <Link href="/" className="text-[11px] text-slate-400 underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300">
              Back to home
            </Link>
            <Link href="/privacy" className="text-[11px] text-slate-400 underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
