import AuthButton from "@/components/auth-button";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/45 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Focused workspace
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Keep applications, job emails, and resumes aligned in one place.
          </p>
        </div>

        <AuthButton />
      </div>
    </header>
  );
}
