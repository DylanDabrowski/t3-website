import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="mx-4 flex min-h-screen justify-center overflow-x-hidden pb-14">
      <div className="mt-[150px] w-[800px]">{props.children}</div>
    </main>
  );
};
