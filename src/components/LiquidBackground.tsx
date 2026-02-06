"use client";

import { motion } from "framer-motion";

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#070b1a]">
      {/* Primary mesh orbs */}
      <motion.div
        className="absolute w-[900px] h-[900px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(30,58,138,0.8) 0%, rgba(15,23,42,0) 70%)", left: "-10%", top: "-20%" }}
        animate={{ x: [0, 100, -50, 0], y: [0, 70, -40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(161,130,50,0.7) 0%, rgba(15,23,42,0) 70%)", right: "-5%", top: "10%" }}
        animate={{ x: [0, -80, 50, 0], y: [0, -60, 80, 0], scale: [1, 0.85, 1.15, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(148,163,184,0.6) 0%, rgba(15,23,42,0) 70%)", left: "30%", bottom: "-15%" }}
        animate={{ x: [0, -90, 60, 0], y: [0, 50, -70, 0], scale: [1, 1.15, 0.8, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary accent orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)", left: "50%", top: "20%" }}
        animate={{ x: [0, -40, 60, 0], y: [0, 80, -30, 0], scale: [0.9, 1.1, 0.95, 0.9] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)", left: "10%", top: "60%" }}
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 60, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora sweep */}
      <motion.div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: "linear-gradient(110deg, transparent 30%, rgba(59,130,246,0.3) 45%, rgba(139,92,246,0.3) 55%, transparent 70%)" }}
        animate={{ x: ["-50%", "100%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1a] via-transparent to-[#070b1a] opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,26,0.4)_100%)]" />
    </div>
  );
}
