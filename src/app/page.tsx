import Link from "next/link";
import { FiArrowRight, FiBriefcase, FiFileText, FiInbox, FiPercent, FiTarget, FiTrendingUp, FiXCircle } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

import MetricCard from "@/components/ui/metric-card";
import PageHeader from "@/components/ui/page-header";
import { getStatusLabel } from "@/lib/application-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [applications, pendingImports, companies, resumes] = await Promise.all([
    prisma.application.findMany({
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        source: true,
        createdAt: true,
      },
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
  const interviews = applications.filter(
    (application) => application.status === "interview",
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
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader
        eyebrow="Dashboard"
        title="Run your search with a cleaner operating rhythm"
        description="See the pipeline, review new imports, and keep resume versions ready without bouncing between cluttered screens."
        badges={[
          { label: `${companies} companies tracked` },
          { label: `${resumes} resume versions saved`, tone: "blue" },
        ]}
        actions={
          <>
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
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Total tracked" value={total} tone="slate" icon={<FiBriefcase className="h-4 w-4" />} />
        <MetricCard label="Active pipeline" value={active} tone="blue" icon={<FiTarget className="h-4 w-4" />} />
        <MetricCard label="Interviewing" value={interviews} tone="amber" icon={<FiTrendingUp className="h-4 w-4" />} />
        <MetricCard label="Offers" value={offers} tone="emerald" icon={<FiInbox className="h-4 w-4" />} />
        <MetricCard label="Rejected" value={rejected} tone="rose" icon={<FiXCircle className="h-4 w-4" />} />
        <MetricCard label="Interview rate" value={interviewRate} suffix="%" tone="violet" icon={<FiPercent className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
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
            <div className="grid gap-3 lg:grid-cols-2">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
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

        <section className="space-y-4 rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
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
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
    >
      <span className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-sm leading-5 text-slate-500">{description}</span>
      </span>
    </Link>
  );
}