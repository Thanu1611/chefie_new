import { Suspense } from "react";
import { MobileBottomNav } from "./MobileBottomNav";
import { Navbar } from "./Navbar";
import { NavbarAuth } from "./NavbarAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-6xl justify-end px-4 pt-2 md:hidden lg:px-6">
        <Suspense fallback={null}>
          <NavbarAuth />
        </Suspense>
      </div>
      <main className="mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-8 lg:px-6">
        {children}
      </main>
      <MobileBottomNav />
    </>
  );
}
