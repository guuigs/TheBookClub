"use client";

import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "discrete" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-dark text-white rounded-lg hover:opacity-90",
      secondary:
        "bg-white text-dark border border-dark rounded-lg hover:bg-cream",
      discrete:
        "text-primary underline hover:opacity-80 bg-transparent",
      danger:
        "bg-red-600 text-white rounded-lg hover:bg-red-700",
    };

    const sizes = {
      xs: "px-3 py-1.5 text-xs tracking-tight",
      sm: "px-4 py-2 text-sm tracking-tight",
      md: "px-5 py-2.5 text-body tracking-tight",
      lg: "px-6 py-3 text-body tracking-tight",
    };

    // Discrete variant doesn't need size padding
    const sizeStyles = variant === "discrete" ? "text-body tracking-tight" : sizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizeStyles} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
