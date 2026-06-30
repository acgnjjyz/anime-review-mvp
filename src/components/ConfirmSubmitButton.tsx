"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  className: string;
  confirmMessage: string;
  pendingLabel: string;
};

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
  pendingLabel,
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
