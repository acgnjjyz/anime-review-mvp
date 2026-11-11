"use client";

import { UiButton, UiText } from "@/components/UiText";


import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: ReactNode;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
  title?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabled = false,
  title,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <UiButton
      aria-disabled={isDisabled}
      className={className}
      disabled={isDisabled}
      title={title}
      type="submit"
    >
      {pending ? <UiText text={pendingLabel} /> : children}
    </UiButton>
  );
}
