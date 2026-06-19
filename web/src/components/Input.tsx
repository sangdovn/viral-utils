import type { InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

const sizes: Record<InputSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

export const Input = ({
  className = "",
  inputSize = "md",
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  ...props
}: InputProps) => (
  <input
    className={`border border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${sizes[inputSize]} ${className}`}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    disabled={disabled}
    {...props}
  />
);
