"use client";

import SaveToListModal from "@/features/place-lists/components/SaveToListModal";

interface Props {
  placeId:   string;
  placeName: string;
  isSaved?:  boolean;
  className?: string;
}

/** Opens a list picker to save/remove a place from the user's lists. */
export default function SaveButton({
  placeId,
  placeName,
  isSaved = false,
  className = "",
}: Props) {
  return (
    <SaveToListModal
      placeId={placeId}
      placeName={placeName}
      isSaved={isSaved}
      className={className}
    />
  );
}
