export const dynamic = "force-dynamic";

import Link from "next/link";

import ApplicationForm from "@/components/applicationForm";
import KanbanBoard from "@/components/kanbanBoard";
import PageHeader from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function ApplicationsPage() {
  const [applications, pendingImports, resumes] = await Promise.all([
    prisma.application.findMany({
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        source: true,
        resumeId: true,
        resume: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ dateApplied: "desc" }, { createdAt: "desc" }],
    }),
    prisma.importedEmail.count({
      where: { reviewed: false },
    }),
    prisma.resume.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  const activePipeline = applications.filter(
    (application) => !["offer", "rejected", "withdrawn"].includes(application.status),
  ).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Applications"
        title="Track every application"
        description="See your progress, update each stage, and note which resume you sent."
        badges={[
          { label: `${applications.length} applications` },
          { label: `${activePipeline} in progress`, tone: "blue" },
          { label: `${pendingImports} emails to review`, tone: "amber" },
        ]}
        actions={
          <>
            <Link
              href="/review"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Review emails
            </Link>
            <ApplicationForm resumes={resumes} />
          </>
        }
      />

      <KanbanBoard applications={applications} resumes={resumes} />
    </div>
  );
}
