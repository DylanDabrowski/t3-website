const roles = [
  {
    company: "Porter Airlines",
    timeframe: "May 2023 — Present",
    title: "Web Developer",
    summary:
      "Owning the FlyPorter.com experience end-to-end: Next.js, modern .NET services, and performance-focused DX.",
    highlights: [
      "Shipped booking flows with improved conversion and accessibility scores",
      "Introduced component guidelines and design tokens for faster delivery",
      "Built instrumentation that cut issue triage time dramatically",
    ],
    accent: "from-cyan-400 to-blue-500",
  },
  {
    company: "Cloud DX",
    timeframe: "May 2022 — Apr 2023",
    title: "Web Dev Lead",
    summary:
      "Led the web layer for the vital measurements platform powering remote patient monitoring.",
    highlights: [
      "Created reusable UI system for clinician dashboards",
      "Optimized data-heavy charts for slower clinical devices",
      "Partnered with product to validate patient journeys quickly",
    ],
    accent: "from-amber-300 to-pink-400",
  },
  {
    company: "Code Ninjas",
    timeframe: "May 2020 — Dec 2020",
    title: "Instructor",
    summary: "Helped kids fall in love with code through playful projects.",
    highlights: [
      "Guided learners through their first games and websites",
      "Built mini-curricula that blended logic and creativity",
    ],
    accent: "from-emerald-300 to-purple-400",
  },
];

export default function Work() {
  return (
    <section className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950/60 via-slate-900/50 to-slate-900/80 p-6 shadow-2xl backdrop-blur lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.08),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(244,114,182,0.12),transparent_32%)]" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/5" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
              Experience
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Places that shaped my craft
            </h2>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          {roles.map((role) => (
            <article
              key={role.company}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 shadow-lg"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${role.accent}`}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pl-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-zinc-400">
                    {role.timeframe}
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    {role.company}
                  </h3>
                  <p className="text-sm text-cyan-200">{role.title}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200">
                  Shipping-focused
                </div>
              </div>
              <p className="mt-3 max-w-3xl pl-4 text-sm text-zinc-300">
                {role.summary}
              </p>
              <ul className="mt-3 space-y-2 pl-8 text-sm text-zinc-300">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
