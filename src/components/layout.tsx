import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen flex-col items-center overflow-x-hidden bg-page-background">
      <div className="mt-[150px] w-[800px]">{props.children}</div>
    </main>
  );
};
