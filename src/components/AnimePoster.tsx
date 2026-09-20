"use client";

import { useState } from "react";

type AnimePosterProps = {
  src: string;
  alt: string;
  className?: string;
};

export function AnimePoster({ src, alt, className }: AnimePosterProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const resolvedSource = !src || failedSource === src ? "/images/catalog-placeholder.svg" : src;
  return (
    <img
      src={resolvedSource}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSource(src)}
    />
  );
}
