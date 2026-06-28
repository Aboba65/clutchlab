import { NavLink } from "react-router-dom";

export function NotFoundPage({
  title = "Page not found",
  description = "Такой страницы нет. Вернись на главную или выбери раздел в навигации.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
        404
      </p>
      <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-slate-400">{description}</p>
      <NavLink
        to="/"
        className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200"
      >
        Back to overview
      </NavLink>
    </section>
  );
}
