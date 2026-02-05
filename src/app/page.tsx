"use client";

import LiquidBackground from "@/components/LiquidBackground";
import GlassCard from "@/components/GlassCard";
import GooeyButton from "@/components/GooeyButton";
import LiquidBlob from "@/components/LiquidBlob";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center text-white">
      <LiquidBackground />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Hero blob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <LiquidBlob size={0.8} progress={0.3} />
        </motion.div>

        <motion.h1
          className="mt-8 font-serif text-5xl font-bold leading-tight tracking-tight md:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Великое
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            Преобразование
          </span>
        </motion.h1>

        <motion.p
          className="mt-4 max-w-md text-lg text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Интерактивная презентация о реформах Петра I
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Link href="/host">
            <GooeyButton variant="gold" className="min-w-[200px] py-4 text-lg">
              Режим ведущего
            </GooeyButton>
          </Link>
          <Link href="/play">
            <GooeyButton variant="silver" className="min-w-[200px] py-4 text-lg">
              Присоединиться
            </GooeyButton>
          </Link>
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <GlassCard className="px-6 py-3">
            <p className="font-mono text-xs text-white/30">
              Откройте{" "}
              <span className="text-amber-300/60">/play</span> на телефонах
              участников
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
