"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/navigation/Sidebar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noSidebar = [
    "/login",
    "/register",
    "/verify-register",
    "/verify-login",
  ];
  const showSidebar = !noSidebar.includes(pathname);
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="h-screen flex flex-col font-sans antialiased">
        <div className="flex flex-1 overflow-hidden">
          {showSidebar && (
            <div className="hidden sticky top-0 lg:block">
              <Sidebar />
            </div>
          )}
          <div className="flex flex-1 flex-col overflow-auto">{children}</div>
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}
