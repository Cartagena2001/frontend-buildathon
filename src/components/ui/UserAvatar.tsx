interface Props {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-9 h-9 text-sm",
  md: "w-20 h-20 text-2xl",
  lg: "w-24 h-24 text-3xl",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
}: Props) {
  const label = initials(name) || "U";
  const sizeClass = sizeClasses[size];

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name || "Profile photo"}
        className={`rounded-full object-cover flex-shrink-0 bg-fp-border ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-fp-red text-fp-on-accent font-bold flex items-center justify-center flex-shrink-0 ${sizeClass} ${className}`}
    >
      {label}
    </div>
  );
}
