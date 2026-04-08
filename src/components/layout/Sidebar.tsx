"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBriefcase,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
  FiHome,
  FiInbox,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: Array<{ name: string; href: string; icon: IconType }> = [
  { name: "Dashboard", href: "/", icon: FiHome },
  { name: "Applications", href: "/applications", icon: FiBriefcase },
  { name: "Review", href: "/review", icon: FiInbox },
  { name: "Companies", href: "/companies", icon: HiOutlineBuildingOffice2 },
  { name: "Resumes", href: "/resumes", icon: FiFileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden shrink-0 border-r border-slate-200/80 bg-white/90 p-3 transition-all duration-200 lg:flex lg:flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`mb-4 flex gap-2 ${
          collapsed ? "justify-center" : "items-center justify-between"
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              JH
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">JobHuntHQ</h1>
              <p className="text-xs text-slate-500">Pipeline, review, and resumes</p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiChevronsRight className="h-4 w-4" />
          ) : (
            <FiChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="space-y-1.5">
        {!collapsed ? (
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Workspace
          </p>
        ) : null}

        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              title={collapsed ? link.name : undefined}
              className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center px-0" : "gap-3"
              } ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{link.name}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
