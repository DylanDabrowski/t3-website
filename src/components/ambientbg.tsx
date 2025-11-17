import { motion } from "framer-motion";

type Orb = {
  className: string;
  size: number;
  x: string;
  y: string;
  duration: number;
  delay?: number;
};

const orbs: Orb[] = [
  {
    className: "from-cyan-400/35 to-transparent",
    size: 520,
    x: "-18%",
    y: "-12%",
    duration: 26,
  },
  {
    className: "from-indigo-400/28 to-transparent",
    size: 480,
    x: "62%",
    y: "-8%",
    duration: 32,
  },
  {
    className: "from-emerald-300/24 to-transparent",
    size: 440,
    x: "12%",
    y: "48%",
    duration: 30,
  },
  {
    className: "from-sky-300/18 to-transparent",
    size: 380,
    x: "72%",
    y: "58%",
    duration: 34,
    delay: 4,
  },
];

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.06),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(147,51,234,0.06),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.05),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_18%,rgba(255,255,255,0)_82%,rgba(255,255,255,0.04)_100%)] opacity-70 mix-blend-screen" />
      {orbs.map((orb, idx) => (
        <motion.div
          key={idx}
          className={`pointer-events-none absolute rounded-full bg-gradient-to-br ${orb.className} mix-blend-screen blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: ["-6%", "4%", "-3%", "5%", "-4%"],
            y: ["-4%", "3%", "-5%", "4%", "-2%"],
            rotate: [0, 8, -10, 6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: orb.duration,
            ease: "easeInOut",
            delay: orb.delay ?? 0,
          }}
        />
      ))}
      <motion.div
        className="absolute -left-1/3 top-0 h-[120%] w-[40%] rotate-12 bg-gradient-to-b from-cyan-300/12 via-transparent to-transparent blur-[72px] mix-blend-screen"
        animate={{ x: ["0%", "16%", "4%", "20%", "0%"] }}
        transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/3 top-16 h-[110%] w-[38%] -rotate-6 bg-gradient-to-b from-violet-400/10 via-transparent to-transparent blur-[70px] mix-blend-screen"
        animate={{ x: ["0%", "-18%", "-6%", "-22%", "0%"] }}
        transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
      />
    </div>
  );
}
