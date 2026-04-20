"use client";

import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  className?: string;
  label?: string;
};

export default function GoogleSignInButton({
  callbackUrl,
  className,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void signIn("google", { callbackUrl })}
      className={className}
    >
      {label}
    </button>
  );
}
