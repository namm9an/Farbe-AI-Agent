"use client";
import { cn } from "@/lib/utils";

export const YellowGlowBackground = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("min-h-screen w-full relative bg-white", className)}>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #FFF991 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
