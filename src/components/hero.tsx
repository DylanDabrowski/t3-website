import Image from "next/image";
import type { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin, Mail, Sparkles } from "lucide-react";

import pfp2 from "../assets/pfp2.JPG";

type SocialLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const socials: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dylandabrowski/", icon: <Linkedin className="h-4 w-4" /> },
  { label: "Github", href: "https://github.com/DylanDabrowski", icon: <Github className="h-4 w-4" /> },
  { label: "Instagram", href: "https://www.instagram.com/dylandabrowski/", icon: <Instagram className="h-4 w-4" /> },
  { label: "Mail", href: "mailto:dylandabrowski@gmail.com", icon: <Mail className="h-4 w-4" /> },
];

const chips = [
  "Full-stack craft with Next.js & .NET",
  "Building the FlyPorter digital experience",
  "Toronto-based; open to new collabs",
];

export default function Hero() {
  return (
    <section className="relative mb-16 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/70 via-slate-900/80 to-slate-950 p-8 shadow-2xl backdrop-blur-lg md:p-10">
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-16 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_35%)]" />
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-10 bg-gradient-to-r from-cyan-400/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              <Sparkles className="mr-2 inline-block h-4 w-4 text-cyan-300" />
              Portfolio refresh 2025
            </p>
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-default-text md:text-5xl">
              Dylan Dabrowski
            </h1>
            <p className="mt-2 text-lg font-light text-zinc-300 md:text-xl">
              Software Engineer crafting thoughtful, fast experiences across web
              and cloud.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {chips.map((chip) => (
              <div
                key={chip}
                className="group flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-zinc-200 shadow-lg transition duration-200 hover:border-cyan-400/40 hover:bg-white/10"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                {chip}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-default-text transition duration-150 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-white/10"
              >
                <span className="text-white/80 transition duration-150 group-hover:text-white">
                  {social.icon}
                </span>
                {social.label}
              </a>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative flex w-full justify-center lg:w-auto"
        >
          <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="absolute -right-6 bottom-2 h-16 w-16 rounded-full bg-indigo-500/25 blur-2xl" />
          <motion.div
            initial={{ rotate: -2, scale: 0.96 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-[6px] shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.3),transparent_40%)]" />
            <Image
              className="relative h-64 w-64 rounded-[22px] object-cover md:h-72 md:w-72"
              src={pfp2 as StaticImageData}
              alt={"profile picture"}
              width={288}
              height={288}
              priority
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Always learning & shipping
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
