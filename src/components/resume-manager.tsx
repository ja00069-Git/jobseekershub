"use client";

import { useState } from "react";
import { FiExternalLink, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

type ResumeItem = {
  id: string;
  name: string;
  fileUrl: string;
  createdAt: string;
  applicationCount: number;
};

const resumeDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatResumeDate(value: string) {
  return resumeDateFormatter.format(new Date(value));
}

export default function ResumeManager({
  initialResumes,
}: {
  initialResumes: ResumeItem[];
}) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          fileUrl,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ResumeItem
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "error" in data ? data.error || "Failed to save resume." : "Failed to save resume.",
        );
      }

      const createdResume = {
        ...(data as ResumeItem),
        applicationCount: 0,
      };
      setResumes((current) => [createdResume, ...current]);
      setName("");
      setFileUrl("");
      setMessage("Resume saved.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      const response = await fetch("/api/resumes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete resume.");
      }

      setResumes((current) => current.filter((resume) => resume.id !== id));
      setMessage("Resume removed.");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Delete failed.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm xl:sticky xl:top-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Resumes
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Add a resume
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Save a name and a file link so you can reuse the right resume later.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="Marketing resume"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Link to file</span>
            <input
              type="url"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="https://drive.google.com/..."
              value={fileUrl}
              onChange={(event) => setFileUrl(event.target.value)}
              required
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FiPlus className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save resume"}
        </button>
      </form>

      <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Saved resumes
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Your resumes
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {resumes.length} total
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No resumes saved yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {resumes.map((resume) => (
              <article
                key={resume.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FiFileText className="h-4 w-4 text-slate-500" />
                      <span>{resume.name}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Added {formatResumeDate(resume.createdAt)}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {resume.applicationCount} linked application{resume.applicationCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    {deletingId === resume.id ? "Removing..." : "Remove"}
                  </button>
                </div>

                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  <FiExternalLink className="h-4 w-4" />
                  Open file
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}