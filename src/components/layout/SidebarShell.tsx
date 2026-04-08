"use client";

import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => (
    <aside className="hidden w-20 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col" />
  ),
});

export default function SidebarShell() {
  return <Sidebar />;
}
