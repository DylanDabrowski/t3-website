import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="relative mx-4 flex min-h-screen justify-center overflow-x-hidden bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0b0f1e] pb-14">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:140px_140px] opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(129,140,248,0.08),transparent_25%)]" />
      <div className="relative mt-[120px] w-full max-w-5xl px-2 md:px-0">
        {props.children}
      </div>
    </main>
  );
};
