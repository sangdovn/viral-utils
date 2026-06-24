import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Page = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("max-w-container mx-auto my-10 px-5 font-sans", className)} {...props}>
    {children}
  </div>
);

export const PageHeader = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("mb-6 flex flex-wrap items-start justify-between gap-4", className)}
    {...props}
  >
    {children}
  </div>
);

interface PageTitleProps extends ComponentPropsWithoutRef<"h2"> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export const PageTitle = ({ as: Tag = "h1", className, children, ...props }: PageTitleProps) => (
  <Tag className={cn("m-0 text-2xl font-bold text-foreground", className)} {...props}>
    {children}
  </Tag>
);

export const PageSubtitle = ({ className, children, ...props }: ComponentPropsWithoutRef<"p">) => (
  <p className={cn("mt-1 text-xs text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const PageFooter = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"footer">) => (
  <footer className={cn("mt-6 border-t pt-4 text-sm text-muted-foreground", className)} {...props}>
    {children}
  </footer>
);
