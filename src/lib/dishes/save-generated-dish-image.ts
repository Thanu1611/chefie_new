import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { GeneratedDishImage } from "@/lib/gemini/generate-dish-image";

const GENERATED_DIR = join(process.cwd(), "public", "generated-dishes");

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

/** Persist AI image to /public/generated-dishes or return a data URL fallback. */
export function saveGeneratedDishImage(
  filenameBase: string,
  image: GeneratedDishImage,
): string {
  const ext = extensionForMime(image.mimeType);
  const filename = filenameBase.replace(/\.(jpg|jpeg|png|webp)$/i, "") + `.${ext}`;

  try {
    mkdirSync(GENERATED_DIR, { recursive: true });
    const dest = join(GENERATED_DIR, filename);
    writeFileSync(dest, image.buffer);
    return `/generated-dishes/${filename}`;
  } catch (error) {
    console.error("[saveGeneratedDishImage] disk write failed, using data URL:", error);
    const base64 = image.buffer.toString("base64");
    return `data:${image.mimeType};base64,${base64}`;
  }
}
