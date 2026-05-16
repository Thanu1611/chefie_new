/** Returns true when this nav link should show the active state. */
export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/cuisines") {
    return pathname === "/cuisines" || pathname.startsWith("/cuisines/");
  }

  if (href === "/meal-planning") {
    return (
      pathname === "/meal-planning" ||
      pathname.startsWith("/meal-planning/") ||
      pathname === "/shopping-list" ||
      pathname.startsWith("/shopping-list/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
