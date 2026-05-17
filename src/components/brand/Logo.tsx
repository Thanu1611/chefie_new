import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: number;
  href?: string;
  className?: string;
}

export function Logo({ size = 40, href = "/", className }: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="Chefie"
      width={size}
      height={size}
      className={cn("rounded-xl object-contain", className)}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-85">
        {img}
      </Link>
    );
  }

  return img;
}
