import { useState } from "react";
import { Package } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  objectFit?: "contain" | "cover";
};

export default function ProductImage({
  src,
  alt,
  className = "",
  objectFit = "contain",
}: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className}`}
        aria-label={`Image not available for ${alt}`}
      >
        <Package className="w-10 h-10 mb-2 opacity-40" />
        <span className="text-xs font-medium opacity-60">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
