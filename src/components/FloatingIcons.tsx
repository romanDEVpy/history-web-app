"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const ICON_SETS: Record<string, string[]> = {
  anchor: ["⚓", "🚢", "⛵", "🌊", "🔨"],
  scissors: ["✂️", "🪙", "👑", "💰", "🧔"],
  balance: ["⚖️", "📜", "🏛️", "👁️", "🔱"],
  book: ["📖", "✒️", "🔤", "📝", "🅰️"],
  calendar: ["📅", "🎄", "🎆", "❄️", "🕐"],
  building: ["🏗️", "🧱", "🏰", "⛪", "🌉"],
  factory: ["🏭", "⚒️", "🔥", "⚙️", "💎"],
  medal: ["🎖️", "⭐", "🏅", "👔", "📊"],
  star: ["⭐", "🌟", "✨", "💫", "🏆"],
  crown: ["👑", "🦅", "⚜️", "🗡️", "🛡️"],
  compass: ["🧭", "🗺️", "⚔️", "🏴", "🌍"],
};

interface FloatingIconsProps {
  icon?: string;
  count?: number;
}

export default function FloatingIcons({ icon = "star", count = 12 }: FloatingIconsProps) {
  const set = ICON_SETS[icon] ?? ICON_SETS.star;
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: set[i % set.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 16 + Math.random() * 20,
        dur: 18 + Math.random() * 20,
        delay: Math.random() * -15,
        rotate: Math.random() * 360,
      })),
    [set, count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <motion.span
          key={it.id}
          className="absolute select-none"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            fontSize: it.size,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -30, 20, 0],
            x: [0, 15, -10, 0],
            opacity: [0, 0.2, 0.15, 0],
            rotate: [it.rotate, it.rotate + 60, it.rotate - 30, it.rotate],
            scale: [0.7, 1, 0.85, 0.7],
          }}
          transition={{
            duration: it.dur,
            repeat: Infinity,
            delay: it.delay,
            ease: "easeInOut",
          }}
        >
          {it.emoji}
        </motion.span>
      ))}
    </div>
  );
}
