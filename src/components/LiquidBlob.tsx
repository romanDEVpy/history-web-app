"use client";

import { motion } from "framer-motion";

interface LiquidBlobProps {
  /** 0-1 progress for color morphing */
  progress?: number;
  /** Optional scale multiplier */
  size?: number;
  /** Vote ratio -1 (all no) to 1 (all yes) for color shifting */
  voteRatio?: number;
}

/**
 * A CSS-only "liquid metal" blob using the gooey filter technique.
 * Represents the "State" changing shape based on user interaction.
 */
export default function LiquidBlob({
  progress = 0,
  size = 1,
  voteRatio = 0,
}: LiquidBlobProps) {
  // Interpolate hue: deep blue (220) → gold (45) based on progress
  const baseHue = 220 - progress * 175;
  // Vote ratio shifts saturation: negative = desaturated, positive = vivid gold
  const sat = 50 + voteRatio * 30;
  const light = 52 + progress * 12;

  const color1 = `hsl(${baseHue}, ${sat}%, ${light}%)`;
  const color2 = `hsl(${baseHue + 30}, ${sat + 10}%, ${light + 10}%)`;
  const color3 = `hsl(${baseHue - 20}, ${sat}%, ${light - 5}%)`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 280 * size, height: 280 * size }}
    >
      {/* SVG filter for gooey merging */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className="relative w-full h-full"
        style={{ filter: "url(#gooey)" }}
      >
        {/* Central mass */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "55%",
            height: "55%",
            left: "22.5%",
            top: "22.5%",
            background: `radial-gradient(circle at 35% 35%, ${color2}, ${color1})`,
            boxShadow: `0 0 60px ${color1}44`,
          }}
          animate={{
            borderRadius: [
              "42% 58% 63% 37% / 41% 44% 56% 59%",
              "58% 42% 37% 63% / 56% 59% 41% 44%",
              "45% 55% 60% 40% / 50% 42% 58% 50%",
              "42% 58% 63% 37% / 41% 44% 56% 59%",
            ],
            scale: [1, 1.06, 0.97, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting satellite 1 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "22%",
            height: "22%",
            background: `radial-gradient(circle at 40% 40%, ${color3}, ${color1})`,
            boxShadow: `0 0 30px ${color3}33`,
          }}
          animate={{
            left: ["60%", "15%", "55%", "60%"],
            top: ["10%", "55%", "65%", "10%"],
            scale: [0.9, 1.1, 0.85, 0.9],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting satellite 2 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "18%",
            height: "18%",
            background: `radial-gradient(circle at 40% 40%, ${color2}, ${color3})`,
            boxShadow: `0 0 25px ${color2}33`,
          }}
          animate={{
            left: ["10%", "60%", "20%", "10%"],
            top: ["60%", "20%", "10%", "60%"],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small droplet */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "12%",
            height: "12%",
            background: `radial-gradient(circle, ${color2}, ${color1})`,
          }}
          animate={{
            left: ["45%", "70%", "30%", "45%"],
            top: ["70%", "35%", "50%", "70%"],
            opacity: [0.7, 1, 0.6, 0.7],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Glass sheen overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
