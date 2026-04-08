import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AuthProvider from "@/components/auth-provider";
import SidebarShell from "@/components/layout/SidebarShell";
import TopBar from "@/components/layout/TopBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobHuntHQ — Career Operating System",
  description:
    "Track applications, review Gmail imports, manage companies and resumes, and stay organized through every stage of your search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="text-slate-900">
        <AuthProvider>
          <div className="flex min-h-screen">
            <SidebarShell />

            <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
              <TopBar />

              <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
