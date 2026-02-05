"use client";

import { useSessionState } from "@/lib/useSessionState";
import { SLIDES } from "@/lib/slides";
import GlassCard from "./GlassCard";
import GooeyButton from "./GooeyButton";
import LiquidBackground from "./LiquidBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PlayerMobile() {
  const { state, loading } = useSessionState(1000);
  const slide = SLIDES[state.currentSlide] ?? SLIDES[0];
  const [joined, setJoined] = useState(false);
  const hasJoinedRef = useRef(false);

  // Register as active user once
  useEffect(() => {
    if (!hasJoinedRef.current) {
      hasJoinedRef.current = true;
      fetch("/api/session", { method: "POST" }).then(() => setJoined(true));
    }
  }, []);

  if (loading || !joined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LiquidBackground />
        <motion.p
          className="font-serif text-xl text-white/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Подключение...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col text-white">
      <LiquidBackground />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-6 safe-area-inset">
        {/* Status bar */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            Участник
          </p>
          <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[10px] text-white/40 border border-white/10">
            {state.activeUsers} онлайн
          </span>
        </div>

        {/* Main interaction area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col"
          >
            {slide.type === "wait" && <WaitView />}
            {slide.type === "info" && <InfoView slide={slide} />}
            {slide.type === "activity_ships" && (
              <ShipActivity shipTaps={state.shipTaps} />
            )}
            {slide.type === "activity_beard" && (
              <BeardActivity votes={state.beardVotes} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-views ───────────────────────────────────────────────────────

function WaitView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {/* Breathing orb */}
      <motion.div
        className="mb-8 h-32 w-32 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #3b82f6, #1e3a8a, #0f172a)",
          boxShadow: "0 0 80px rgba(59,130,246,0.2)",
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <h2 className="mb-2 font-serif text-2xl text-white/80">
        Великое Преобразование
      </h2>
      <p className="font-mono text-sm text-white/30">Ожидание начала...</p>
    </div>
  );
}

function InfoView({ slide }: { slide: { title: string; subtitle?: string; body?: string } }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-2">
      <GlassCard className="w-full max-w-sm p-6" glow={0.3}>
        <h2 className="mb-2 font-serif text-2xl font-bold text-white/90">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mb-4 text-sm text-amber-300/70">{slide.subtitle}</p>
        )}
        {slide.body && (
          <p className="text-sm leading-relaxed text-white/50">{slide.body}</p>
        )}
      </GlassCard>
    </div>
  );
}

function ShipActivity({ shipTaps }: { shipTaps: number }) {
  const [localTaps, setLocalTaps] = useState(0);
  const pendingRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushTaps = useCallback(() => {
    if (pendingRef.current > 0) {
      const amount = pendingRef.current;
      pendingRef.current = 0;
      fetch("/api/tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
    }
  }, []);

  const handleTap = useCallback(() => {
    setLocalTaps((t) => t + 1);
    pendingRef.current += 1;
    // Debounce: flush every 300ms
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushTaps, 300);
  }, [flushTaps]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      flushTaps();
    };
  }, [flushTaps]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <h2 className="font-serif text-xl text-white/80">Создание Флота</h2>
      <p className="font-mono text-xs text-white/30">
        Стучите, чтобы строить корабли!
      </p>

      {/* Big tap target */}
      <motion.button
        onTap={handleTap}
        className="relative flex h-44 w-44 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10"
        style={{
          boxShadow: "0 0 60px rgba(59,130,246,0.15), inset 0 0 30px rgba(59,130,246,0.1)",
          backdropFilter: "blur(20px)",
        }}
        whileTap={{ scale: 0.88, backgroundColor: "rgba(59,130,246,0.25)" }}
        transition={{ type: "spring", stiffness: 600, damping: 15 }}
      >
        {/* Ripple */}
        <motion.div
          key={localTaps}
          className="absolute inset-0 rounded-full border-2 border-blue-400/40"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
        <span className="font-serif text-5xl text-blue-200">
          {localTaps}
        </span>
      </motion.button>

      <p className="font-mono text-xs text-white/20">
        Всего ударов: {shipTaps}
      </p>
    </div>
  );
}

function BeardActivity({ votes }: { votes: { yes: number; no: number } }) {
  const [voted, setVoted] = useState(false);

  const castVote = async (yes: boolean) => {
    if (voted) return;
    setVoted(true);
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yes }),
    });
  };

  const total = votes.yes + votes.no;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2">
      <h2 className="font-serif text-xl text-white/80">Налог на бороды</h2>
      <p className="text-center text-sm text-white/40">
        Сбрить бороду — или заплатить налог?
      </p>

      {!voted ? (
        <div className="flex w-full max-w-xs gap-4">
          <GooeyButton
            variant="gold"
            className="flex-1 py-6 text-lg"
            onClick={() => castVote(true)}
          >
            Сбрить
          </GooeyButton>
          <GooeyButton
            variant="silver"
            className="flex-1 py-6 text-lg"
            onClick={() => castVote(false)}
          >
            Заплатить
          </GooeyButton>
        </div>
      ) : (
        <GlassCard className="w-full max-w-xs p-6 text-center" glow={0.4}>
          <p className="mb-4 font-mono text-sm text-amber-300/80">
            Ваш голос учтён!
          </p>
          <div className="flex justify-around">
            <div>
              <p className="font-mono text-xs text-white/30">Сбрить</p>
              <p className="font-serif text-2xl text-green-400">{votes.yes}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-white/30">Налог</p>
              <p className="font-serif text-2xl text-red-400">{votes.no}</p>
            </div>
          </div>
          {total > 0 && (
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5 border border-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${(votes.yes / total) * 100}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
