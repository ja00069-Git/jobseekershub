export const dynamic = "force-dynamic";

import Link from "next/link";
import { FiBriefcase, FiFileText, FiInbox } from "react-icons/fi";

import ApplicationForm from "@/components/applicationForm";
import KanbanBoard from "@/components/kanbanBoard";
import { prisma } from "@/lib/prisma";

export default async function ApplicationsPage() {
  const [applications, pendingImports, resumes] = await Promise.all([
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
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
  const interviewing = applications.filter((application) =>
    ["phone", "interview"].includes(application.status),
  ).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Application board
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage your pipeline in one place
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Drag roles between stages, log manual applications, and keep your resume and review workflow connected.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {applications.length} tracked roles
            </div>
            <Link
              href="/review"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Review imports ({pendingImports})
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <ApplicationForm resumes={resumes} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Pipeline overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Keep momentum across every stage
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={<FiBriefcase className="h-4 w-4" />}
              label="Active pipeline"
              value={activePipeline}
            />
            <SummaryCard
              icon={<FiInbox className="h-4 w-4" />}
              label="Pending review"
              value={pendingImports}
            />
            <SummaryCard
              icon={<FiFileText className="h-4 w-4" />}
              label="Saved resumes"
              value={resumes.length}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Interview momentum</p>
            <p className="mt-1">
              {interviewing} roles are currently in phone screen or interview stages.
            </p>
          </div>
        </section>
      </div>

      <KanbanBoard applications={applications} />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="rounded-full bg-white p-2 text-slate-700 shadow-sm">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
