import Link from "next/link";

import GmailSyncButton from "@/components/gmail-sync-button";
import ReviewQueue from "../../components/ReviewQueue";
import PageHeader from "@/components/ui/page-header";
import { getPendingImportsCount } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const pendingImports = await getPendingImportsCount();

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Review"
        title="Approve imported emails without the noise"
        description="Confirm the company and role, then push the right emails into your application board in one pass."
        badges={[{ label: `${pendingImports} pending`, tone: "amber" }]}
        actions={
          <>
            <GmailSyncButton />
            <Link
              href="/applications"
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
            >
              Back to applications
            </Link>
          </>
        }
      />

      <ReviewQueue />
    </div>
  );
}
