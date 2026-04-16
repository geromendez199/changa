import { useMemo, useState } from "react";
import { BRAND, BRAND_LOGO_CANDIDATES } from "../../constants/brand";

interface BrandLogoProps {
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
}

export function BrandLogo({
  className = "",
  frameClassName = "overflow-hidden",
  imageClassName = "h-20 w-auto object-contain",
  fallbackClassName = "text-3xl font-bold tracking-tight",
  alt,
}: BrandLogoProps) {
  const [logoIndex, setLogoIndex] = useState(0);

  const logoSrc = useMemo(() => BRAND_LOGO_CANDIDATES[logoIndex], [logoIndex]);

  if (!logoSrc) {
    return <span className={fallbackClassName}>{BRAND.fallbackName}</span>;
  }

  return (
    <div className={`flex items-center justify-center ${className}`.trim()}>
      <div className={frameClassName}>
        <img
          src={logoSrc}
          alt={alt ?? BRAND.appName}
          className={`block max-w-none origin-center scale-[2.4] ${imageClassName}`.trim()}
          onError={() => setLogoIndex((current) => current + 1)}
        />
      </div>
    </div>
  );
}
