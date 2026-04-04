import type { ReactNode } from "react";
import { Link } from "react-router";

type RouteLink = {
  label: string;
  to: string;
};

type RoutePlaceholderProps = {
  title: string;
  description: string;
  children?: ReactNode;
  links: RouteLink[];
};

export const RoutePlaceholder = ({
  title,
  description,
  children,
  links,
}: RoutePlaceholderProps) => {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 bg-[var(--patient-surface)] px-4 py-6 text-slate-900">
      <section className="rounded-[28px] bg-[var(--patient-primary)] px-5 py-6 text-white shadow-[0_24px_60px_rgba(0,185,107,0.28)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/70">
          Patient H5
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/88">{description}</p>
      </section>

      {children ? (
        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          {children}
        </section>
      ) : null}

      <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Route Entry
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex min-h-11 items-center justify-between rounded-2xl border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.99]"
            >
              <span>{link.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};
