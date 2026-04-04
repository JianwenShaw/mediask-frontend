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
    <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-[240px_1fr] gap-6 px-6 py-8">
      <aside className="rounded-[28px] bg-slate-950 px-5 py-6 text-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          Backoffice
        </p>
        <h1 className="mt-4 text-2xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        <div className="mt-6 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl border border-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
      <section className="rounded-[28px] border border-blue-100 bg-white p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Route Shell
          </p>
          {children ? (
            children
          ) : (
            <p className="text-sm leading-7 text-slate-600">
              当前页面已经预留正式业务路由，后续任务会在这个应用内补齐医生工作台、接诊、病历、处方与审计功能。
            </p>
          )}
        </div>
      </section>
    </main>
  );
};
