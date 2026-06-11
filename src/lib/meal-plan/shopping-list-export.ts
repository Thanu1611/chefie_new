import { jsPDF } from "jspdf";
import { colors } from "@/lib/theme/colors";
import type { ShoppingListItem } from "@/types/meal-plan";
import type { ShoppingListLine } from "@/lib/meal-plan/shopping-list-merge";

type ExportItem = Pick<ShoppingListItem, "ingredientName" | "quantity" | "purchased">;

function formatListText(items: ExportItem[]): string {
  if (items.length === 0) return "Shopping list (empty)";
  const lines = ["Chefie Shopping List", ""];
  for (const item of items) {
    const check = item.purchased ? "[x]" : "[ ]";
    const qty = item.quantity ? ` (${item.quantity})` : "";
    lines.push(`${check} ${item.ingredientName}${qty}`);
  }
  return lines.join("\n");
}

export async function copyShoppingListToClipboard(items: ExportItem[]): Promise<void> {
  const text = formatListText(items);
  await navigator.clipboard.writeText(text);
}

export function downloadShoppingListPdf(items: ExportItem[], filename = "shopping-list.pdf"): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(255, 144, 102);
  doc.text("Chefie Shopping List", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFontSize(11);
  doc.setTextColor(45, 36, 32);

  if (items.length === 0) {
    doc.text("No items in your list.", 14, y);
    doc.save(filename);
    return;
  }

  for (const item of items) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const mark = item.purchased ? "[x]" : "[ ]";
    const qty = item.quantity ? ` — ${item.quantity}` : "";
    doc.text(`${mark} ${item.ingredientName}${qty}`, 14, y);
    y += 8;
  }

  doc.save(filename);
}

export function downloadShoppingListImage(
  items: ExportItem[],
  filename = "shopping-list.png",
): void {
  const padding = 32;
  const lineHeight = 28;
  const titleHeight = 48;
  const width = 520;
  const height = Math.max(200, padding * 2 + titleHeight + items.length * lineHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = colors.primary;
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText("Chefie Shopping List", padding, padding + 24);

  ctx.font = "15px system-ui, sans-serif";
  ctx.fillStyle = colors.foreground;

  if (items.length === 0) {
    ctx.fillStyle = colors.muted;
    ctx.fillText("No items in your list.", padding, padding + titleHeight + 8);
  } else {
    let y = padding + titleHeight;
    for (const item of items) {
      const mark = item.purchased ? "✓" : "○";
      const qty = item.quantity ? ` (${item.quantity})` : "";
      ctx.fillStyle = item.purchased ? colors.muted : colors.foreground;
      ctx.fillText(`${mark}  ${item.ingredientName}${qty}`, padding, y);
      y += lineHeight;
    }
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export function toExportItems(
  lines: ShoppingListLine[],
): ExportItem[] {
  return lines.map((line) => ({
    ingredientName: line.ingredientName,
    quantity: line.quantity,
    purchased: false,
  }));
}
