"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => null,
});

export default function SidebarShell() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isPublicVisitor = status !== "loading" && !session?.user;
  const isPublicRoute = pathname === "/" || pathname === "/auth" || pathname === "/privacy";

  if (isPublicVisitor && isPublicRoute) {
    return null;
  }

  return <Sidebar />;
}
