"use client";

import Image from "next/image";
import { APP_NAME, BRAND_LOGO } from "@/lib/brand";
import { useTheme } from "@/components/ui/ThemeProvider";

const HEIGHT = {
  sm: "h-5",
  md: "h-6",
  nav: "h-[21px]",
  lg: "h-8",
} as const;

type BrandLogoProps = {
  size?: keyof typeof HEIGHT;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  size = "md",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const logo = theme === "dark" ? BRAND_LOGO.onDark : BRAND_LOGO.onLight;

  return (
    <span
      className={`brand-logo relative inline-flex shrink-0 items-center leading-none ${className}`.trim()}
      aria-label={APP_NAME}
    >
      <Image
        src={logo.src}
        alt=""
        aria-hidden
        width={BRAND_LOGO.width}
        height={BRAND_LOGO.height}
        priority={priority}
        className={`brand-logo__img block ${HEIGHT[size]} w-auto shrink-0`}
      />
    </span>
  );
}
