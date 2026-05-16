"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBook2,
  IconHelp,
  IconHome,
  IconMicrophone,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/recipes", label: "Recipes", icon: IconSearch },
  { href: "/generate", label: "AI", icon: IconSparkles },
  { href: "/voice", label: "Voice", icon: IconMicrophone },
  { href: "/library", label: "Library", icon: IconBook2 },
  { href: "/help", label: "Help", icon: IconHelp },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-warm-200 bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <Icon size={22} stroke={active ? 2 : 1.5} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
