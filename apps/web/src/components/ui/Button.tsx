"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  primary:
    "bg-mango text-white shadow-[0_4px_0_0_var(--zebra-mango-deep)] active:translate-y-1 active:shadow-none hover:brightness-105",
  secondary:
    "bg-teal text-white shadow-[0_4px_0_0_var(--zebra-teal-deep)] active:translate-y-1 active:shadow-none hover:brightness-105",
  ghost: "bg-white/70 text-ink border-2 border-ink/15 hover:bg-white",
  danger: "bg-rose text-white hover:brightness-105",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-base rounded-2xl",
  lg: "px-7 py-3.5 text-lg rounded-3xl",
  xl: "px-9 py-5 text-2xl rounded-3xl", // kid-sized: ≥48px touch target
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-bold transition disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
