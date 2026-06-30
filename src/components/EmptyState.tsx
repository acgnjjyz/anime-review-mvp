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
    <div className="rounded border border-slate-200 bg-white p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-black text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-5 inline-flex h-10 items-center rounded bg-ink px-4 text-sm font-bold text-white hover:bg-slate-700"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
