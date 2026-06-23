import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Page = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("max-w-container mx-auto my-10 px-5 font-sans", className)} {...props}>
    {children}
  </div>
);

export const PageHeader = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex justify-between items-start mb-6", className)} {...props}>
    {children}
  </div>
);

interface PageTitleProps extends ComponentPropsWithoutRef<"h2"> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export const PageTitle = ({ as: Tag = "h2", className, children, ...props }: PageTitleProps) => (
  <Tag className={cn("text-2xl font-bold text-gray-900 m-0", className)} {...props}>
    {children}
  </Tag>
);

export const PageSubtitle = ({ className, children, ...props }: ComponentPropsWithoutRef<"p">) => (
  <p className={cn("text-xs text-gray-400 mt-1", className)} {...props}>
    {children}
  </p>
);

export const PageFooter = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"footer">) => (
  <footer
    className={cn("mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500", className)}
    {...props}
  >
    {children}
  </footer>
);
