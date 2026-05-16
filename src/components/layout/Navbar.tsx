"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBook2,
  IconChefHat,
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
  { href: "/generate", label: "Generate", icon: IconSparkles },
  { href: "/voice", label: "Voice", icon: IconMicrophone },
  { href: "/library", label: "Library", icon: IconBook2 },
  { href: "/help", label: "Help", icon: IconHelp },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="hidden border-b border-warm-200 bg-surface/95 backdrop-blur md:sticky md:top-0 md:z-40 md:block">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="Chefie" width={40} height={40} className="rounded-xl" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Chef<span className="text-brand">ie</span>
          </span>
        </Link>

        <ul className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand/15 text-brand-dark"
                      : "text-muted hover:bg-warm-100 hover:text-foreground",
                  )}
                >
                  <Icon size={18} stroke={1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/recipes" className="btn-primary hidden lg:inline-flex">
          <IconChefHat size={18} stroke={1.75} />
          Start Cooking
        </Link>
      </nav>
    </header>
  );
}
