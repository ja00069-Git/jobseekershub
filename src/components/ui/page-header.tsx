import type { ReactNode } from "react";

type BadgeTone = "slate" | "blue" | "emerald" | "amber" | "violet";

type PageHeaderBadge = {
  label: ReactNode;
  tone?: BadgeTone;
};

const badgeToneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100",
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  badges = [],
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  badges?: PageHeaderBadge[];
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}

          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {badges.map((badge) => (
                <span
                  key={String(badge.label)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeToneClasses[badge.tone ?? "slate"]}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
