export const dynamic = "force-dynamic";

import { FiFileText, FiLink2 } from "react-icons/fi";

import ResumeManager from "@/components/resume-manager";
import MetricCard from "@/components/ui/metric-card";
import PageHeader from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function ResumesPage() {
  const resumes = await prisma.resume.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      fileUrl: true,
      createdAt: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  const resumesInUse = resumes.filter((resume) => resume._count.applications > 0).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Resumes"
        title="Manage your resumes"
        description="Keep your resume versions in one place so you can choose the right one quickly."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:max-w-3xl">
        <MetricCard label="Saved resumes" value={resumes.length} icon={<FiFileText className="h-4 w-4" />} tone="slate" />
        <MetricCard label="Resumes in use" value={resumesInUse} icon={<FiLink2 className="h-4 w-4" />} tone="blue" />
      </div>

      <ResumeManager
        initialResumes={resumes.map((resume) => ({
          id: resume.id,
          name: resume.name,
          fileUrl: resume.fileUrl,
          createdAt: resume.createdAt.toISOString(),
          applicationCount: resume._count.applications,
        }))}
      />
    </div>
  );
}