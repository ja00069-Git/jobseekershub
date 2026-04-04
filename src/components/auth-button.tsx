"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">
        Loading account...
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur">
          <p className="font-semibold">{session.user.name ?? "Signed in"}</p>
          <p className="text-xs text-slate-300">{session.user.email}</p>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void signIn("google")}
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
    >
      Continue with Google
    </button>
  );
}
