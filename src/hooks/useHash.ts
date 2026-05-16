"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Current URL hash including `#`, e.g. `#cuisines`. Empty string if none. */
export function useHash(): string {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  return hash;
}
