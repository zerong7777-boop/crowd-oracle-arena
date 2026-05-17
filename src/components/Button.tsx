import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = variant === "primary" ? "primary-button" : "secondary-button";
  return <button className={`${base} ${className}`.trim()} {...props} />;
}
