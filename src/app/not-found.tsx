import Link from "next/link";
import { FiArrowLeft, FiBriefcase, FiSearch } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="ui-surface-card ui-animate-enter p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <FiSearch className="h-5 w-5" />
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Page not found
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The link may be old, incomplete, or the page may have moved.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/" className="ui-btn-primary">
            <FiArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <Link href="/applications" className="ui-btn-secondary">
            <FiBriefcase className="h-4 w-4" />
            View applications
          </Link>
        </div>
      </div>
    </div>
  );
}
