export const dynamic = "force-dynamic";

import { FiBriefcase, FiGlobe } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

import { getStatusLabel } from "@/lib/application-status";
import { prisma } from "@/lib/prisma";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      applications: {
        orderBy: [{ dateApplied: "desc" }, { createdAt: "desc" }],
        take: 4,
      },
    },
    orderBy: { name: "asc" },
  });

  const totalApplications = companies.reduce(
    (sum, company) => sum + company.applications.length,
    0,
  );
  const activeCompanies = companies.filter((company) =>
    company.applications.some(
      (application) => !["offer", "rejected", "withdrawn"].includes(application.status),
    ),
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Companies
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Track every company relationship
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          JobHuntHQ now groups applications by company so you can see repeat activity and hiring history in one view.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<HiOutlineBuildingOffice2 className="h-5 w-5" />} label="Companies tracked" value={companies.length} />
        <StatCard icon={<FiBriefcase className="h-5 w-5" />} label="Applications logged" value={totalApplications} />
        <StatCard icon={<FiGlobe className="h-5 w-5" />} label="Active company pipelines" value={activeCompanies} />
      </div>

      {companies.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No companies yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Companies will be created automatically when you import or add applications.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {companies.map((company) => (
            <article
              key={company.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{company.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {company.website || "Website can be added later"}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {company.applications.length} applications
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {company.applications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No applications attached yet.
                  </div>
                ) : (
                  company.applications.map((application) => (
                    <div
                      key={application.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{application.role}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {application.dateApplied.toLocaleDateString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {getStatusLabel(application.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="rounded-full bg-slate-100 p-2 text-slate-700">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}