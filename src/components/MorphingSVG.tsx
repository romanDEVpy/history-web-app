"use client";

import { motion } from "framer-motion";

interface MorphingSVGProps {
  variant?: "ship" | "city" | "crown" | "scroll";
  className?: string;
  color?: string;
}

const PATHS = {
  ship: [
    "M50,85 L15,65 Q10,60 15,55 L50,20 Q55,15 60,20 L85,55 Q90,60 85,65 Z",
    "M50,80 L10,60 Q5,55 12,48 L50,15 Q58,10 65,18 L90,50 Q95,58 88,62 Z",
    "M50,82 L18,62 Q12,58 18,52 L50,18 Q56,12 62,18 L82,52 Q88,58 82,62 Z",
  ],
  city: [
    "M20,80 L20,40 L35,40 L35,30 L50,15 L65,30 L65,40 L80,40 L80,80 Z",
    "M15,80 L15,45 L30,45 L30,25 L50,10 L70,25 L70,45 L85,45 L85,80 Z",
    "M22,80 L22,42 L38,42 L38,28 L50,12 L62,28 L62,42 L78,42 L78,80 Z",
  ],
  crown: [
    "M15,70 L25,30 L40,50 L50,20 L60,50 L75,30 L85,70 Z",
    "M12,72 L22,25 L38,48 L50,15 L62,48 L78,25 L88,72 Z",
    "M18,68 L28,32 L42,52 L50,22 L58,52 L72,32 L82,68 Z",
  ],
  scroll: [
    "M20,25 Q20,15 30,15 L70,15 Q80,15 80,25 L80,75 Q80,85 70,85 L30,85 Q20,85 20,75 Z",
    "M18,28 Q18,13 32,13 L68,13 Q82,13 82,28 L82,72 Q82,87 68,87 L32,87 Q18,87 18,72 Z",
    "M22,26 Q22,16 31,16 L69,16 Q78,16 78,26 L78,74 Q78,84 69,84 L31,84 Q22,84 22,74 Z",
  ],
};

export default function MorphingSVG({
  variant = "crown",
  className = "",
  color = "rgba(245,158,11,0.3)",
}: MorphingSVGProps) {
  const paths = PATHS[variant];

  return (
    <svg viewBox="0 0 100 100" className={`${className}`} fill="none">
      <motion.path
        d={paths[0]}
        fill={color}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
        animate={{ d: paths }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d={paths[0]}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
        animate={{ d: [...paths].reverse() }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
