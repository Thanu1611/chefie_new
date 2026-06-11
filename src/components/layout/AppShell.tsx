import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { MobileBottomNav } from "./MobileBottomNav";
import { Navbar } from "./Navbar";
import { NavbarAuth } from "./NavbarAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Navbar />

      {/* Mobile Header */}
      <header className="navbar-shell sticky top-0 z-40 border-b md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo size={62} />

          <Suspense fallback={null}>
            <NavbarAuth />
          </Suspense>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-1 px-4 pb-24 pt-4 md:pb-8 lg:px-6">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
