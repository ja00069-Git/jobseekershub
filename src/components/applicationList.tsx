import DeleteButton from "@/components/deleteButton";
import StatusDropdown from "@/components/statusDropdown";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  location?: string | null;
  createdAt: string;
};

export default function ApplicationList({
  applications,
}: {
  applications: Application[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Detailed applications list
          </h2>
          <p className="text-sm text-slate-500">
            Review every company, update statuses, and clean up stale entries.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {applications.length} tracked
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 sm:px-6">Company</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right sm:px-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {applications.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No applications yet. Add one from the form to get started.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
                    {app.company}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{app.role}</td>

                  <td className="px-4 py-4">
                    <StatusDropdown id={app.id} currentStatus={app.status} />
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {app.location || "—"}
                  </td>

                  <td className="px-4 py-4 text-right sm:px-6">
                    <DeleteButton id={app.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}