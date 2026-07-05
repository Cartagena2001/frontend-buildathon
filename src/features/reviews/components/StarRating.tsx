"use client";

import { useState } from "react";

function StarIcon({ fill, size }: { fill: number; size: number }) {
  // fill: 0 (empty), 0.5 (half), 1 (full)
  const id = `star-${Math.round(fill * 100)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={fill >= 1 ? "currentColor" : fill > 0 ? `url(#${id})` : "transparent"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Readonly star display, supports fractional values (e.g. 4.5). */
export function StarRatingDisplay({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-fp-coral ${className}`}
      role="img"
      aria-label={`${value} / 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(Math.max(value - (star - 1), 0), 1);
        return <StarIcon key={star} fill={fill >= 0.75 ? 1 : fill >= 0.25 ? 0.5 : 0} size={size} />;
      })}
    </span>
  );
}

/** Interactive star input (1-5). */
export function StarRatingInput({
  value,
  onChange,
  size = 28,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} / 5`}
          disabled={disabled}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
            star <= shown ? "text-fp-coral" : "text-fp-border"
          }`}
        >
          <StarIcon fill={star <= shown ? 1 : 0} size={size} />
        </button>
      ))}
    </div>
  );
}
