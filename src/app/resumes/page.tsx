export const dynamic = "force-dynamic";

import { FiFileText, FiLink2 } from "react-icons/fi";

import ResumeManager from "@/components/resume-manager";
import { prisma } from "@/lib/prisma";

export default async function ResumesPage() {
  const [resumes, applicationsWithResumes] = await Promise.all([
    prisma.resume.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.count({
      where: {
        NOT: { resumeId: null },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Resumes
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Keep resume versions organized
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Save resume variants for different industries, then attach them to new applications from the board.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiFileText className="h-4 w-4" />
              Saved versions
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{resumes.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiLink2 className="h-4 w-4" />
              Linked applications
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{applicationsWithResumes}</p>
          </div>
        </div>
      </section>

      <ResumeManager
        initialResumes={resumes.map((resume) => ({
          ...resume,
          createdAt: resume.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}