import Link from "next/link";
import { FiArrowRight, FiBriefcase, FiFileText, FiInbox, FiPercent, FiTarget, FiTrendingUp, FiXCircle } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

import { getStatusLabel } from "@/lib/application-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [applications, pendingImports, companies, resumes] = await Promise.all([
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.importedEmail.count({
      where: { reviewed: false },
    }),
    prisma.company.count(),
    prisma.resume.count(),
  ]);

  const total = applications.length;
  const active = applications.filter(
    (application) =>
      !["offer", "rejected", "withdrawn"].includes(application.status),
  ).length;
  const interviews = applications.filter((application) =>
    ["phone", "interview"].includes(application.status),
  ).length;
  const offers = applications.filter(
    (application) => application.status === "offer",
  ).length;
  const rejected = applications.filter(
    (application) => application.status === "rejected",
  ).length;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

  const recentApplications = applications.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Job search dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Run your search like a modern career operating system
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track active roles, review Gmail imports, organize company history, and keep resume versions ready for every application.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/applications"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open board
            </Link>
            <Link
              href="/review"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Review imports ({pendingImports})
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">{companies} companies tracked</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{resumes} resume versions saved</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card title="Total tracked" value={total} tone="slate" icon={<FiBriefcase className="h-4 w-4" />} />
        <Card title="Active pipeline" value={active} tone="blue" icon={<FiTarget className="h-4 w-4" />} />
        <Card title="Interviewing" value={interviews} tone="amber" icon={<FiTrendingUp className="h-4 w-4" />} />
        <Card title="Offers" value={offers} tone="emerald" icon={<FiInbox className="h-4 w-4" />} />
        <Card title="Rejected" value={rejected} tone="rose" icon={<FiXCircle className="h-4 w-4" />} />
        <Card title="Interview rate" value={interviewRate} suffix="%" tone="violet" icon={<FiPercent className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent applications
              </h2>
              <p className="text-sm text-slate-500">
                A quick view of the latest roles in your tracker.
              </p>
            </div>

            <Link
              href="/applications"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              View full board
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No applications yet. Sync Gmail or add one from the board to get started.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {application.role}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {application.company}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {getStatusLabel(application.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {application.source || "Manual entry"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Workspace shortcuts</h2>
            <p className="text-sm text-slate-500">
              Jump into the parts of the product that need attention next.
            </p>
          </div>

          <Shortcut href="/companies" label="Companies" description="View company history and application counts." icon={<HiOutlineBuildingOffice2 className="h-5 w-5" />} />
          <Shortcut href="/resumes" label="Resumes" description="Manage versions for future submissions." icon={<FiFileText className="h-5 w-5" />} />
          <Shortcut href="/review" label="Review queue" description={`${pendingImports} imports are waiting for approval.`} icon={<FiInbox className="h-5 w-5" />} />
        </section>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  tone,
  icon,
  suffix = "",
}: {
  title: string;
  value: number;
  tone: "slate" | "blue" | "amber" | "emerald" | "rose" | "violet";
  icon: React.ReactNode;
  suffix?: string;
}) {
  const toneClasses = {
    slate: "bg-slate-50 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
  } as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{title}</p>
        <span className={`rounded-full p-2 ${toneClasses[tone]}`}>{icon}</span>
      </div>
      <div className="mt-3 flex items-end gap-1">
        <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
        {suffix ? <span className="pb-1 text-sm font-semibold text-slate-500">{suffix}</span> : null}
      </div>
    </div>
  );
}

function Shortcut({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
    >
      <span className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
      </span>
    </Link>
  );
}