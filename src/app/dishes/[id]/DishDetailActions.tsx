"use client";

import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { useSavedDishes } from "@/hooks/useSavedDishes";

export function DishDetailActions({
  dishId,
  dishName,
}: {
  dishId: string;
  dishName: string;
}) {
  const { loaded, isSaved, toggleSave } = useSavedDishes();
  const saved = isSaved(dishId);

  return (
    <button
      type="button"
      disabled={!loaded}
      onClick={() => toggleSave(dishId, dishName)}
      className={saved ? "btn-primary" : "btn-secondary"}
    >
      {saved ? (
        <>
          <IconBookmarkFilled size={18} />
          Saved to library
        </>
      ) : (
        <>
          <IconBookmark size={18} />
          Add to library
        </>
      )}
    </button>
  );
}
