/** Shared nav row height — matches logo (h-13) for vertical alignment. */
export const NAV_ROW_HEIGHT = "h-13";

/** Internal padding for the nav menu pill card only (not the logo). */
export const NAV_CLUSTER_PADDING = "px-4 py-2.5 sm:px-5 sm:py-2.5";

export const navLogoLinkClassName = `flex ${NAV_ROW_HEIGHT} shrink-0 items-center self-center leading-none`;

type NavBarClusterProps = {
  children: React.ReactNode;
  className?: string;
  /** Warm frosted pill for homepage hero over photography */
  variant?: "default" | "hero";
};

export function NavBarCluster({
  children,
  className = "",
  variant = "default",
}: NavBarClusterProps) {
  const variantClass =
    variant === "hero" ? "nav-hero-cluster" : "nav-cluster-default";

  return (
    <div
      className={`flex items-center gap-3 rounded-full ${NAV_CLUSTER_PADDING} sm:gap-4 ${variantClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function NavBarDivider({ variant = "default" }: { variant?: "default" | "hero" }) {
  return (
    <span
      aria-hidden
      className={`h-4 w-px shrink-0 ${
        variant === "hero" ? "bg-white/20" : "bg-fp-border"
      }`}
    />
  );
}

export const navLinkClassName =
  "whitespace-nowrap text-sm font-medium text-fp-cream/80 transition-colors hover:text-fp-coral";
