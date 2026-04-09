"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FiAlertTriangle, FiHome, FiRefreshCw } from "react-icons/fi";

export default function Error({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleRetry() {
    if (unstable_retry) {
      unstable_retry();
      return;
    }

    if (reset) {
      reset();
      return;
    }

    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="ui-surface-card ui-animate-enter p-6 sm:p-8" role="alert">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30">
            <FiAlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">
              Temporary issue
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              We couldn&apos;t open this page right now.
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your saved applications, resumes, and email reviews are still safe. Try again in a moment or head back to your dashboard.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={handleRetry} className="ui-btn-primary">
            <FiRefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="ui-btn-secondary">
            <FiHome className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
