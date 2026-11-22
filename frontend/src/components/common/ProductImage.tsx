import { useState } from "react";
import { ImageOff, PackageOpen } from "lucide-react";

type Props = { src: string; alt: string; className?: string; objectFit?: "contain" | "cover"; priority?: boolean };
export default function ProductImage({ src, alt, className = "", objectFit = "contain", priority = false }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // The bundled preview references /products/*.webp, but none are in the repo.
  // Do not pretend generic pictures are photographs of the actual products.
  if (!src || src === failedSrc || src.startsWith("/products/")) {
    return (
      <div className={"jn-product-placeholder " + className} role="img" aria-label={alt + ": product photo not available yet"}>
        <span className="jn-product-placeholder__halo" aria-hidden="true" />
        <PackageOpen size={45} strokeWidth={1.1} aria-hidden="true"/>
        <span className="jn-product-placeholder__name">{alt}</span>
        <span className="jn-product-placeholder__note"><ImageOff size={12}/> Photo coming soon</span>
      </div>
    );
  }
  return <img src={src} alt={alt} width={600} height={600} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} style={{ objectFit }} onError={() => setFailedSrc(src)} />;
}
