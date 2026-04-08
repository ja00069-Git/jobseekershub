"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiExternalLink, FiFileText, FiSave } from "react-icons/fi";

import {
  APPLICATION_STATUS_OPTIONS,
  type ApplicationStatus,
} from "@/lib/application-status";

const getTodayDate = () => new Date().toISOString().split("T")[0] ?? "";
const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100";

type ResumeOption = {
  id: string;
  name: string;
};

export default function ApplicationForm({
  resumes = [],
}: {
  resumes?: ResumeOption[];
}) {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [salary, setSalary] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setDateApplied(getTodayDate());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          role,
          status,
          location,
          source,
          jobUrl,
          dateApplied,
          salary,
          resumeId,
          notes,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.error || "Could not save the application.");
      }

      setSuccessMessage("Application added successfully.");
      setCompany("");
      setRole("");
      setStatus("applied");
      setLocation("");
      setSource("");
      setJobUrl("");
      setDateApplied(getTodayDate());
      setSalary("");
      setResumeId("");
      setNotes("");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            New application
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Log an opportunity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Capture the role, source, resume version, and next-step notes in one place.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <FiSave className="h-3.5 w-3.5" />
          Manual entry
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Company</span>
          <input
            className={fieldClassName}
            placeholder="Stripe"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <input
            className={fieldClassName}
            placeholder="Backend Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            className={fieldClassName}
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {APPLICATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Date applied</span>
          <input
            type="date"
            className={fieldClassName}
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Location</span>
          <input
            className={fieldClassName}
            placeholder="Remote or onsite"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Source</span>
          <input
            className={fieldClassName}
            placeholder="LinkedIn, referral, Indeed..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <FiExternalLink className="h-4 w-4" />
            Job URL
          </span>
          <input
            type="url"
            className={fieldClassName}
            placeholder="https://company.com/jobs/example"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Salary</span>
          <input
            type="number"
            min="0"
            className={fieldClassName}
            placeholder="180000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <FiFileText className="h-4 w-4" />
            Resume version
          </span>
          <select
            className={fieldClassName}
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
          >
            <option value="">Not selected</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            className={`${fieldClassName} min-h-24 resize-y`}
            rows={4}
            placeholder="Referral, recruiter notes, next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FiSave className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Add Application"}
        </button>

        <p className="text-xs text-slate-500">
          The board refreshes automatically after a successful save.
        </p>
      </div>
    </form>
  );
}