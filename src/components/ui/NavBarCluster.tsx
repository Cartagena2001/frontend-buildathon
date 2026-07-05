/** Shared nav row height — matches logo (h-13) for vertical alignment. */
export const NAV_ROW_HEIGHT = "h-13";

/** Internal padding for the nav menu pill card only (not the logo). */
export const NAV_CLUSTER_PADDING = "px-4 py-2.5 sm:px-5 sm:py-2.5";

export const navLogoLinkClassName = `flex ${NAV_ROW_HEIGHT} shrink-0 items-center self-center leading-none`;

type NavBarClusterProps = {
  children: React.ReactNode;
  className?: string;
};

export function NavBarCluster({ children, className = "" }: NavBarClusterProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-full border border-white/15 bg-fp-dark/20 ${NAV_CLUSTER_PADDING} shadow-sm backdrop-blur-md sm:gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function NavBarDivider() {
  return <span aria-hidden className="h-4 w-px shrink-0 bg-white/15" />;
}

export const navLinkClassName =
  "whitespace-nowrap text-sm font-medium text-fp-cream/75 transition-colors hover:text-fp-coral";
