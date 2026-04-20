"use client";

import { useLayoutEffect } from "react";

export default function ThemeHydrator() {
  useLayoutEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = savedTheme ? savedTheme === "dark" : systemPrefersDark;

      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    } catch {
      // Ignore storage and media query failures.
    }
  }, []);

  return null;
}