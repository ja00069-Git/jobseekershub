import Link from "next/link";

import GmailSyncButton from "@/components/gmail-sync-button";
import ReviewQueue from "../../components/ReviewQueue";
import { getPendingImportsCount } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const pendingImports = await getPendingImportsCount();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Review
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Imported emails
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {pendingImports} pending
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Review and approve the emails you want added to your tracker.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <GmailSyncButton />
            <Link
              href="/applications"
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
            >
              Back to applications
            </Link>
          </div>
        </div>
      </section>

      <ReviewQueue />
    </div>
  );
}
