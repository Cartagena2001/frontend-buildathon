import Image from "next/image";

interface Props {
  covers: string[];
  alt?: string;
  priority?: boolean;
}

/** Tiled cover layout — same collage logic as list detail / shared heroes. */
export default function PlaceCoverCollage({ covers, alt = "", priority = false }: Props) {
  if (covers.length === 0) return null;

  if (covers.length === 1) {
    return (
      <div className="absolute inset-0">
        <Image
          src={covers[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority}
        />
      </div>
    );
  }

  if (covers.length === 2) {
    return (
      <div className="absolute inset-0 grid grid-cols-2">
        {covers.map((src, i) => (
          <div key={src + i} className="relative overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="50vw"
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 grid grid-cols-3">
      {covers.slice(0, 3).map((src, i) => (
        <div
          key={src + i}
          className={`relative overflow-hidden ${i === 0 ? "col-span-2" : ""}`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
            priority={priority && i === 0}
          />
        </div>
      ))}
    </div>
  );
}
