export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="ui-surface-card ui-animate-enter p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Loading your workspace
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pulling together your applications, emails, and resumes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="ui-surface-card animate-pulse p-4">
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
