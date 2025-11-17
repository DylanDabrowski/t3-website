import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";

const timeline = [
  {
    title: "Porter Airlines",
    role: "Building the FlyPorter digital journey",
    detail:
      "Full-time web dev pushing performance, accessibility, and reliability.",
  },
  {
    title: "Cloud DX",
    role: "Vital measurements platform",
    detail: "Led web experience for remote care tools used by clinicians.",
  },
  {
    title: "Community",
    role: "Mentor & collaborator",
    detail: "Teaching, pairing, and sharing across dev communities in Toronto.",
  },
];

const focuses = [
  "TypeScript-first thinking",
  "Composed UI systems with React/Next.js",
  ".NET + cloud APIs with real-world uptime",
  "Fast shipping, slow design",
];

const stats = [
  { label: "Years shipping", value: "4+", accent: "from-cyan-400 to-blue-500" },
  {
    label: "Products shipped",
    value: "6",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    label: "Fave stack",
    value: "Next.js + Tailwind",
    accent: "from-violet-400 to-indigo-500",
  },
];

export default function AboutMe() {
  return (
    <section className="relative mb-16 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-zinc-950 p-6 shadow-2xl backdrop-blur lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.1),transparent_30%)]" />
      <div className="relative flex flex-col gap-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-100">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                About
              </p>
              <h2 className="text-3xl font-semibold text-default-text md:text-4xl">
                Pragmatic building, calm visuals.
              </h2>
            </div>
          </div>
          <p className="max-w-md text-sm text-zinc-300 md:text-base">
            Solving real problems with calm interfaces. I craft resilient web
            experiences that keep people moving fast without extra noise.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-15 blur-lg`}
              />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-200">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-200">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Current energy
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-default-text">
                  Ship. Iterate. Polish.
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-300 md:text-base">
              I blend product sense with engineering discipline to deliver
              performant experiences. From accessible UI to observability in
              production, I like owning the full loop.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {focuses.map((focus) => (
                <span
                  key={focus}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200"
                >
                  {focus}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 via-white/10 to-white/5 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                Snapshots
              </p>
            </div>
            <div className="mt-4 space-y-4">
              {timeline.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-white/5 p-4 transition duration-150 hover:bg-white/10"
                >
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">
                    {item.role}
                  </p>
                  <p className="mt-2 text-sm text-zinc-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
