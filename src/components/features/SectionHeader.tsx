"use client";

import Link from "next/link";

export interface SectionHeaderProps {
  title: string;
  seeMoreHref?: string;
  seeMoreLabel?: string;
  className?: string;
  titleClassName?: string;
}

export function SectionHeader({
  title,
  seeMoreHref,
  seeMoreLabel = "voir plus",
  className = "",
  titleClassName = "text-t3",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between w-full ${className}`}>
      <h2 className={`font-semibold text-dark tracking-tight ${titleClassName}`}>
        {title}
      </h2>
      {seeMoreHref && (
        <Link
          href={seeMoreHref}
          className="text-small font-semibold text-primary underline tracking-tight hover:opacity-80 transition-opacity"
        >
          {seeMoreLabel}
        </Link>
      )}
    </div>
  );
}
