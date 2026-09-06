import { useState } from "react";
import { ImageOff } from "lucide-react";
type Props = {
  src: string;
  alt: string;
  className?: string;
  objectFit?: "contain" | "cover";
  priority?: boolean;
};
export default function ProductImage({
  src,
  alt,
  className = "",
  objectFit = "contain",
  priority = false,
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc)
    return (
      <div
        className={"image-fallback " + className}
        role="img"
        aria-label={alt + ": photo unavailable"}
      >
        <ImageOff size={28} strokeWidth={1.3} aria-hidden="true" />
        <span>Photo coming soon</span>
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      width={600}
      height={600}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
      style={{ objectFit }}
      onError={() => setFailedSrc(src)}
    />
  );
}
