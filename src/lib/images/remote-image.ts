/** Hosts allowed in next.config.ts `images.remotePatterns`. */
export const ALLOWED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
]);

export const DEFAULT_DISH_IMAGE_URL = "/dish-placeholder.svg";

/** Use only hosts Next.js Image can load; otherwise fallback. */
export function sanitizeRemoteImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return DEFAULT_DISH_IMAGE_URL;

  try {
    const { hostname, protocol } = new URL(trimmed);
    if (protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(hostname)) {
      return trimmed;
    }
  } catch {
    /* invalid URL */
  }

  return DEFAULT_DISH_IMAGE_URL;
}
