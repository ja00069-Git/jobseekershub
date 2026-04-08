import { FiActivity } from "react-icons/fi";

import AuthButton from "@/components/auth-button";

export default function TopBar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FiActivity className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              JobHuntHQ
            </p>
            <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              Job search dashboard
            </h2>
          </div>
        </div>

        <AuthButton />
      </div>
    </header>
  );
}
