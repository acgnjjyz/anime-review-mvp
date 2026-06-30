"use client";

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
    <button
      aria-disabled={isDisabled}
      className={className}
      disabled={isDisabled}
      title={title}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
