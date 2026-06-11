"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarAuth } from "@/components/layout/NavbarAuth";
import {
  IconBook2,
  IconChefHat,
  IconCalendar,
  IconHome,
  IconMicrophone,
  IconSearch,
} from "@tabler/icons-react";
import { GenerateIcon } from "@/components/icons/GenerateIcon";
import { Logo } from "@/components/brand/Logo";
import { isNavLinkActive } from "@/lib/utils/nav-active";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/cuisines", label: "Cuisines", icon: IconSearch },
  { href: "/generate", label: "Generate", icon: GenerateIcon },
  { href: "/voice", label: "Voice", icon: IconMicrophone },
  { href: "/library", label: "Library", icon: IconBook2 },
  { href: "/meal-planning", label: "Meal Planning", icon: IconCalendar },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar-shell hidden border-b md:sticky md:top-0 md:z-40 md:block">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 lg:px-6">
        <Logo size={122} />

        <ul className="flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isNavLinkActive(href, pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn("nav-link", active && "nav-link-active")}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} stroke={1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <Suspense
            fallback={
              <span className="text-sm text-muted" aria-hidden>
                …
              </span>
            }
          >
            <NavbarAuth />
          </Suspense>
          {/* <Link href="/cuisines" className="btn-primary hidden lg:inline-flex">
            <IconChefHat size={18} stroke={1.75} />
            Start Cooking
          </Link> */}
        </div>
      </nav>
    </header>
  );
}
