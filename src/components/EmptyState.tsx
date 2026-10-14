import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon: Icon = SearchX,
}: EmptyStateProps) {
  return (
    <div className="portal-panel rounded-2xl p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-ink">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-black text-heading">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="portal-button-primary mt-5 inline-flex h-10 items-center rounded-full px-4 text-sm font-black"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
