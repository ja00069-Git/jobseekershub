import { FiActivity } from "react-icons/fi";

import AuthButton from "@/components/auth-button";

export default function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FiActivity className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              JobHunt HQ
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Manage your search efficiently
            </h2>
          </div>
        </div>

        <AuthButton />
      </div>
    </header>
  );
}
