"use client";

import { motion } from "framer-motion";
import { SLIDES } from "@/lib/slides";

interface TimelineBarProps {
  currentSlide: number;
}

export default function TimelineBar({ currentSlide }: TimelineBarProps) {
  const slidesWithYears = SLIDES.filter((s) => s.year);
  const progress = currentSlide / Math.max(SLIDES.length - 1, 1);

  return (
    <div className="relative w-full">
      {/* Track */}
      <div className="relative h-1 rounded-full bg-black/[0.06] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, #2563eb, #d97706, #f59e0b)",
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      {/* Year markers */}
      <div className="relative mt-1 flex justify-between">
        {slidesWithYears.map((s, i) => {
          const pos = s.id / Math.max(SLIDES.length - 1, 1);
          const isActive = s.id <= currentSlide;
          const isCurrent = s.id === currentSlide;
          return (
            <motion.div
              key={s.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${pos * 100}%`, transform: "translateX(-50%)" }}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0.4 }}
            >
              <motion.div
                className={`h-2 w-2 rounded-full ${
                  isCurrent
                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : isActive
                    ? "bg-amber-500/60"
                    : "bg-slate-300"
                }`}
                animate={isCurrent ? { scale: [1, 1.4, 1] } : {}}
                transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
              />
              {i % 2 === 0 && (
                <span className="mt-1 font-mono text-[8px] text-slate-400 whitespace-nowrap">
                  {s.year}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
