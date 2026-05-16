import { MobileBottomNav } from "./MobileBottomNav";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-8 lg:px-6">
        {children}
      </main>
      <MobileBottomNav />
    </>
  );
}
