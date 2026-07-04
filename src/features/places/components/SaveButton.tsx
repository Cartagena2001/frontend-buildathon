"use client";

import { useTransition, useState } from "react";
import { savePlace, unsavePlace } from "@/lib/saved/actions";
import type { SavePlaceInput } from "@/lib/saved/actions";

interface Props {
  place:     SavePlaceInput;
  isSaved:   boolean;
  className?: string;
}

export default function SaveButton({ place, isSaved: initialSaved, className = "" }: Props) {
  const [saved, setSaved]     = useState(initialSaved);
  const [pending, start]      = useTransition();

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      if (saved) {
        await unsavePlace(place.placeId);
        setSaved(false);
      } else {
        await savePlace(place);
        setSaved(true);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Quitar de guardados" : "Guardar lugar"}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
        saved
          ? "bg-fp-cyan/20 text-fp-cyan hover:bg-fp-red/20 hover:text-fp-red"
          : "bg-black/50 text-fp-muted hover:bg-fp-cyan/20 hover:text-fp-cyan"
      } ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
