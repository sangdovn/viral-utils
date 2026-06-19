import type { ElementType, HTMLAttributes } from "react";

type Variant = "body" | "caption" | "label" | "error" | "muted";
type Weight = "normal" | "medium" | "semibold";

interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  weight?: Weight;
  as?: ElementType;
}

const variants: Record<Variant, string> = {
  body: "text-sm text-gray-900",
  caption: "text-xs text-gray-500",
  label: "text-sm text-gray-700",
  error: "text-[11px] text-red-500 mt-1 inline-block",
  muted: "text-sm text-gray-400",
};

const weights: Record<Weight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

export default function Text({
  variant = "body",
  weight = "normal",
  as: Component = "span",
  className = "",
  children,
  ...props
}: TextProps) {
  return (
    <Component className={`${variants[variant]} ${weights[weight]} ${className}`} {...props}>
      {children}
    </Component>
  );
}
