"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  /** Extra glow intensity 0-1 */
  glow?: number;
}

export default function GlassCard({
  children,
  className = "",
  glow = 0,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        border border-black/[0.06]
        bg-white/60
        shadow-[0_8px_32px_rgba(0,0,0,0.06)]
        ${className}
      `}
      style={{
        backdropFilter: "blur(40px) saturate(1.4)",
        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
      }}
      {...rest}
    >
      {/* Top edge gloss */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      {/* Left edge gloss */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent" />

      {/* Optional glow */}
      {glow > 0 && (
        <motion.div
          className="pointer-events-none absolute -inset-4 rounded-3xl"
          style={{
            background: `radial-gradient(ellipse at center, rgba(245,158,11,${glow * 0.1}) 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
