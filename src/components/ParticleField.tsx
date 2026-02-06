"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  speed?: number;
}

export default function ParticleField({
  count = 40,
  color = "rgba(161,130,50,0.3)",
  speed = 1,
}: ParticleFieldProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        dur: (15 + Math.random() * 25) / speed,
        delay: Math.random() * -20,
        dx: (Math.random() - 0.5) * 30,
        dy: (Math.random() - 0.5) * 30,
      })),
    [count, speed]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{
            x: [0, p.dx, -p.dx * 0.5, 0],
            y: [0, p.dy, -p.dy * 0.7, 0],
            opacity: [0, 0.8, 0.4, 0],
            scale: [0.5, 1.2, 0.8, 0.5],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
