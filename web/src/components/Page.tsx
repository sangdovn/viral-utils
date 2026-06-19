import type { HTMLAttributes } from "react";

export const Page = ({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`max-w-190 mx-auto mt-10 mb-10 px-5 font-sans ${className}`} {...props}>
    {children}
  </div>
);

export const PageHeader = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex justify-between items-start mb-6 ${className}`} {...props}>
    {children}
  </div>
);

export const Title = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-[22px] font-bold text-gray-900 m-0 ${className}`} {...props}>
    {children}
  </h2>
);

export const Subtitle = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-[13px] text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
);
