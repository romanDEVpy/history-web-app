"use client";

import { motion } from "framer-motion";

interface WaveProgressProps {
  progress: number; // 0–1
  label?: string;
  color?: string;
  height?: number;
}

export default function WaveProgress({
  progress,
  label,
  color = "#3b82f6",
  height = 120,
}: WaveProgressProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      style={{ height }}
    >
      {/* Water fill */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        animate={{ height: `${progress * 100}%` }}
        transition={{ type: "spring", stiffness: 40, damping: 15 }}
        style={{ background: `linear-gradient(180deg, ${color}44, ${color}cc)` }}
      >
        {/* Animated wave SVG */}
        <svg
          className="absolute -top-3 left-0 w-[200%]"
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          style={{ height: 24 }}
        >
          <motion.path
            d="M0,20 C150,35 350,5 600,20 C850,35 1050,5 1200,20 L1200,40 L0,40 Z"
            fill={color}
            fillOpacity={0.5}
            animate={{ x: [0, -600] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M0,25 C200,10 400,35 600,25 C800,10 1000,35 1200,25 L1200,40 L0,40 Z"
            fill={color}
            fillOpacity={0.3}
            animate={{ x: [0, -600] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </motion.div>

      {/* Glass shine */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/10" />

      {/* Label */}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="relative z-10 font-mono text-sm font-bold text-white/80 drop-shadow-lg">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
