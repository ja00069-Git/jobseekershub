import ApplicationForm from "@/components/applicationForm";
import ApplicationList from "@/components/applicationList";
import AuthButton from "@/components/auth-button";
import KanbanBoard from "@/components/kanbanBoard";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  location?: string | null;
  createdAt: string;
};

async function getApplications() {
  const res = await fetch("http://localhost:3000/api/applications", {
    cache: "no-store",
  });

  if (!res.ok) {
    return [] as Application[];
  }

  return (await res.json()) as Application[];
}

export default async function Home() {
  const applications = await getApplications();

  const stats = [
    {
      label: "Total tracked",
      value: applications.length,
    },
    {
      label: "Active pipeline",
      value: applications.filter(
        (application) =>
          !["offer", "rejected", "withdrawn"].includes(application.status),
      ).length,
    },
    {
      label: "Interviewing",
      value: applications.filter((application) =>
        ["phone", "interview"].includes(application.status),
      ).length,
    },
    {
      label: "Offers",
      value: applications.filter((application) => application.status === "offer")
        .length,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
                Job pipeline dashboard
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Stay on top of every job application in one place.
                </h1>
                <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                  Track outreach, interview progress, and offers with a cleaner
                  board plus a detailed table view.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-4 lg:items-end">
              <AuthButton />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"
                  >
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)] xl:items-start">
          <div className="space-y-6 xl:sticky xl:top-6">
            <ApplicationForm />

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Quick workflow tips
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Start promising leads in <strong>Wishlist</strong>.</li>
                <li>• Use <strong>Phone</strong> and <strong>Interview</strong> to track active loops.</li>
                <li>• Keep notes updated so follow-ups are easy.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Kanban pipeline
                  </h2>
                  <p className="text-sm text-slate-500">
                    A quick visual view of where each application currently sits.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {applications.length} cards
                </span>
              </div>

              <KanbanBoard applications={applications} />
            </section>

            <section>
              <ApplicationList applications={applications} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}