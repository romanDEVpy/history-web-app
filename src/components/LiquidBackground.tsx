"use client";

import { motion } from "framer-motion";

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#070b1a]">
      {/* Mesh gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(30,58,138,0.8) 0%, rgba(15,23,42,0) 70%)",
          left: "-10%",
          top: "-20%",
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(161,130,50,0.7) 0%, rgba(15,23,42,0) 70%)",
          right: "-5%",
          top: "10%",
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, -50, 70, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(148,163,184,0.6) 0%, rgba(15,23,42,0) 70%)",
          left: "30%",
          bottom: "-15%",
        }}
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 40, -60, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Top vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1a] via-transparent to-[#070b1a] opacity-40" />
    </div>
  );
}
