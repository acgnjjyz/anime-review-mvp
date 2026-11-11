"use client";

import { UiImage } from "@/components/UiText";


import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type AnimePosterProps = {
  src: string;
  alt: string;
  className?: string;
};

export function AnimePoster({ src, alt, className }: AnimePosterProps) {
  const { t } = useLocale();
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const resolvedSource = !src || failedSource === src ? "/images/catalog-placeholder.svg" : src;
  return (
    <UiImage
      src={resolvedSource}
      alt={t(alt)}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSource(src)}
    />
  );
}
