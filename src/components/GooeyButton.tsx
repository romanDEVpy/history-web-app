"use client";

import { motion } from "framer-motion";
import { type ReactNode, type MouseEventHandler } from "react";

interface GooeyButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  variant?: "gold" | "silver" | "danger";
  disabled?: boolean;
}

const VARIANT_STYLES = {
  gold: "from-amber-500/20 to-yellow-600/20 border-amber-400/30 hover:border-amber-300/50 text-amber-100",
  silver:
    "from-slate-300/20 to-slate-500/20 border-slate-400/30 hover:border-slate-300/50 text-slate-100",
  danger:
    "from-red-500/20 to-rose-600/20 border-red-400/30 hover:border-red-300/50 text-red-100",
};

export default function GooeyButton({
  children,
  onClick,
  className = "",
  variant = "gold",
  disabled = false,
}: GooeyButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl
        border bg-gradient-to-br px-6 py-3
        font-medium tracking-wide
        transition-colors duration-300
        disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${className}
      `}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      whileTap={disabled ? {} : { scale: 0.92 }}
      whileHover={disabled ? {} : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
    >
      {/* Liquid shine on hover */}
      <motion.span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
