export const dynamic = "force-dynamic";

import { FiFileText, FiLink2 } from "react-icons/fi";

import ResumeManager from "@/components/resume-manager";
import MetricCard from "@/components/ui/metric-card";
import PageHeader from "@/components/ui/page-header";
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
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Resumes"
        title="Keep resume versions tidy and ready to use"
        description="Store the variants you actually send, then attach them to applications directly from the board."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:max-w-3xl">
        <MetricCard label="Saved versions" value={resumes.length} icon={<FiFileText className="h-4 w-4" />} tone="slate" />
        <MetricCard label="Linked applications" value={applicationsWithResumes} icon={<FiLink2 className="h-4 w-4" />} tone="blue" />
      </div>

      <ResumeManager
        initialResumes={resumes.map((resume) => ({
          ...resume,
          createdAt: resume.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}