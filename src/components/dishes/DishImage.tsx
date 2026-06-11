"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DISH_PLACEHOLDER } from "@/lib/dishes/dish-images";
import { cn } from "@/lib/utils/cn";

interface DishImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function DishImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: DishImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [usePlaceholder, setUsePlaceholder] = useState(false);
  const isDataUrl = currentSrc.startsWith("data:");

  useEffect(() => {
    setCurrentSrc(src);
    setUsePlaceholder(false);
  }, [src]);

  const handleError = () => {
    if (!usePlaceholder) {
      setUsePlaceholder(true);
      setCurrentSrc(DISH_PLACEHOLDER);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      unoptimized={usePlaceholder || isDataUrl}
    />
  );
}
