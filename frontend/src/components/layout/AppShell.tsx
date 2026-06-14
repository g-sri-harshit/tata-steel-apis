"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Demo mode: auto-login if no token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("apis_token");
      if (!token) {
        // Set demo user automatically
        localStorage.setItem("apis_token", "demo-token");
        localStorage.setItem("apis_user", JSON.stringify({
          id: "usr_001",
          name: "Rajesh Kumar",
          role: "Plant Director",
          email: "admin@tatasteel.com",
          plant: "All Plants",
        }));
      }
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-steel-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading APIS…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-surface">
        {children}
      </main>
    </div>
  );
}
