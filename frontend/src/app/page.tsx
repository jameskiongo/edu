"use client";

import { useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">app</div>
    </div>
  );
}
