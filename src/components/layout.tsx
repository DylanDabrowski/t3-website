import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="relative mx-auto flex min-h-screen justify-center overflow-x-hidden bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#05070c] pb-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,212,255,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(167,139,250,0.12),transparent_26%)]" />
      <div className="relative mt-[96px] w-full max-w-6xl px-4 md:px-10">
        {props.children}
      </div>
    </main>
  );
};
