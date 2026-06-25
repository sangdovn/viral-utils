import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Page = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("mx-auto w-full max-w-7xl px-4 py-6 font-sans sm:px-6 lg:px-8", className)}
    {...props}
  >
    {children}
  </div>
);

export const PageHeader = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

interface PageTitleProps extends ComponentPropsWithoutRef<"h2"> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export const PageTitle = ({ as: Tag = "h1", className, children, ...props }: PageTitleProps) => (
  <Tag
    className={cn("m-0 text-2xl font-semibold tracking-normal text-foreground", className)}
    {...props}
  >
    {children}
  </Tag>
);

export const PageSubtitle = ({ className, children, ...props }: ComponentPropsWithoutRef<"p">) => (
  <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const PageActions = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-wrap items-center gap-2 sm:justify-end", className)} {...props}>
    {children}
  </div>
);

export const PageTabs = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("mb-5 flex min-h-10 items-end gap-1 overflow-x-auto border-b", className)}
    {...props}
  >
    {children}
  </div>
);

export const PageToolbar = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "mb-4 flex flex-col gap-3 border-b bg-muted/20 px-0 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const PageContent = ({ className, children, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("space-y-6", className)} {...props}>
    {children}
  </div>
);

export const PageSection = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) => (
  <section className={cn("space-y-4", className)} {...props}>
    {children}
  </section>
);

export const PageFooter = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"footer">) => (
  <footer className={cn("mt-8 border-t pt-4 text-sm text-muted-foreground", className)} {...props}>
    {children}
  </footer>
);
