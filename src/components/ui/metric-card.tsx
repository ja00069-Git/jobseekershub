import type { ReactNode } from "react";

type Tone = "slate" | "blue" | "amber" | "emerald" | "rose" | "violet";

const toneClasses: Record<Tone, string> = {
  slate: "bg-slate-50 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
};

export default function MetricCard({
  label,
  value,
  icon,
  tone = "slate",
  suffix = "",
  helper,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: Tone;
  suffix?: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
          {helper ? <p className="mt-0.5 text-[10px] text-slate-400">{helper}</p> : null}

          <div className="mt-1.5 flex items-end gap-1">
            <p className="text-[24px] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
            {suffix ? <span className="pb-0.5 text-[11px] font-semibold text-slate-500">{suffix}</span> : null}
          </div>
        </div>

        <span className={`shrink-0 rounded-lg p-1.5 ${toneClasses[tone]}`}>{icon}</span>
      </div>
    </div>
  );
}
