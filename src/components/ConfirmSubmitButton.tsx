"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { UiText } from "@/components/UiText";
import { useLocale } from "@/components/LocaleProvider";

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
  const { t } = useLocale();

  return (
    <button
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(t(confirmMessage))) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {pending ? <UiText text={pendingLabel} /> : children}
    </button>
  );
}
