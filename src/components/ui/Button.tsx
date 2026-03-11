"use client";

import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "discrete";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-dark text-white rounded-lg hover:opacity-90",
      secondary:
        "bg-white text-dark border border-dark rounded-lg hover:bg-cream",
      discrete:
        "text-primary underline hover:opacity-80 bg-transparent",
    };

    const sizes = {
      sm: "px-4 py-2.5 text-sm tracking-tight",
      md: "px-5 py-3 text-body tracking-tight",
      lg: "px-6 py-3.5 text-body tracking-tight",
    };

    // Discrete variant doesn't need size padding
    const sizeStyles = variant === "discrete" ? "text-body tracking-tight" : sizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizeStyles} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
