import type { ReactNode } from "react";

interface Props {
  action: ReactNode;
}

export function SystemsPageHeader({ action }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
          Systems
        </h1>

        <p className="font-medium text-gray-600 text-md sm:text-sm">
          Systems management
        </p>
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
