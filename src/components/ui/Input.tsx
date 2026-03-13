"use client";

import { forwardRef } from "react";
import { Search } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search";
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "default", error, className = "", ...props }, ref) => {
    const baseStyles =
      "w-full font-medium text-body tracking-tight transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
      default:
        "px-4 py-3 bg-white border border-gray rounded-lg text-dark placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary",
      search:
        "pl-12 pr-5 py-3 bg-dark text-gray placeholder:text-gray rounded-lg",
    };

    return (
      <div className="relative">
        {variant === "search" && (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" aria-hidden="true" />
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${variants[variant]} ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
