import type { HTMLAttributes } from "react";

interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
}

const variantClass = {
  info: "bg-gray-100 text-gray-600",
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-red-600",
};

export default function Notice({ children, variant = "info" }: NoticeProps) {
  return (
    <div
      className={`p
        x-4 py-3 rounded-lg text-sm mb-3 
        ${variantClass[variant]}
      `}
    >
      {children}
    </div>
  );
}
