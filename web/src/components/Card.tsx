import type { HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", children, ...props }: DivProps) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-4 md:p-5 mb-4 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardLabel = ({ className = "", children, ...props }: DivProps) => (
  <div
    className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 ${className}`}
    {...props}
  >
    {children}
  </div>
);
