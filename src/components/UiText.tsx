"use client";

import type { ComponentPropsWithRef } from "react";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

export function UiText({ text }: { text: string | number | null | undefined }) {
  const { t } = useLocale();
  return typeof text === "string" ? t(text) : (text ?? null);
}

export function LocaleText({ en, ja }: { en: string; ja: string }) {
  const { locale } = useLocale();
  return locale === "ja" ? ja : en;
}

function useLocalizedAttributes(props: { placeholder?: string; title?: string; alt?: string; "aria-label"?: string }) {
  const { t } = useLocale();
  return {
    ...(props.placeholder ? { placeholder: t(props.placeholder) } : {}),
    ...(props.title ? { title: t(props.title) } : {}),
    ...(props.alt ? { alt: t(props.alt) } : {}),
    ...(props["aria-label"] ? { "aria-label": t(props["aria-label"]) } : {}),
  };
}

export function UiInput({ localizeInitialValue = false, ...props }: ComponentPropsWithRef<"input"> & { localizeInitialValue?: boolean }) {
  const attributes = useLocalizedAttributes(props);
  const { t } = useLocale();
  const [edited, setEdited] = useState<string | undefined>();
  if (!localizeInitialValue) return <input {...props} {...attributes} />;
  const original = String(props.defaultValue ?? "");
  return <>
    <input {...props} {...attributes} defaultValue={undefined} name={undefined}
      value={edited ?? original.split(",").map((value) => t(value.trim())).join(", ")}
      onChange={(event) => { setEdited(event.target.value); props.onChange?.(event); }} />
    <input name={props.name} type="hidden" value={edited ?? original} />
  </>;
}

export function UiTextarea({ localizeInitialValue = false, ...props }: ComponentPropsWithRef<"textarea"> & { localizeInitialValue?: boolean }) {
  const attributes = useLocalizedAttributes(props);
  const { t } = useLocale();
  const [edited, setEdited] = useState<string | undefined>();
  if (!localizeInitialValue) return <textarea {...props} {...attributes} />;
  const original = String(props.defaultValue ?? "");
  return <>
    <textarea {...props} {...attributes} defaultValue={undefined} name={undefined} value={edited ?? t(original)}
      onChange={(event) => { setEdited(event.target.value); props.onChange?.(event); }} />
    <input name={props.name} type="hidden" value={edited ?? original} />
  </>;
}

export function UiButton(props: ComponentPropsWithRef<"button">) {
  const attributes = useLocalizedAttributes(props);
  return <button {...props} {...attributes} />;
}

export function UiLink(props: ComponentPropsWithRef<typeof Link>) {
  const attributes = useLocalizedAttributes(props);
  return <Link {...props} {...attributes} />;
}

export function UiNav(props: ComponentPropsWithRef<"nav">) {
  const attributes = useLocalizedAttributes(props);
  return <nav {...props} {...attributes} />;
}

export function UiDiv(props: ComponentPropsWithRef<"div">) {
  const attributes = useLocalizedAttributes(props);
  return <div {...props} {...attributes} />;
}

export function UiIframe(props: ComponentPropsWithRef<"iframe">) {
  const attributes = useLocalizedAttributes(props);
  return <iframe {...props} {...attributes} />;
}

export function UiImage(props: ComponentPropsWithRef<"img">) {
  const attributes = useLocalizedAttributes(props);
  return <img {...props} {...attributes} />;
}
