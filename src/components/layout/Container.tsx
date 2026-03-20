export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
