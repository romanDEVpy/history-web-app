"use client";

import { useSessionState } from "@/lib/useSessionState";
import { SLIDES } from "@/lib/slides";
import GlassCard from "./GlassCard";
import GooeyButton from "./GooeyButton";
import LiquidBlob from "./LiquidBlob";
import LiquidBackground from "./LiquidBackground";
import { motion, AnimatePresence } from "framer-motion";

const SHIP_GOAL = 200;

export default function HostDashboard() {
  const { state, loading, setSlide, reset } = useSessionState(800);
  const slide = SLIDES[state.currentSlide] ?? SLIDES[0];
  const totalVotes = state.beardVotes.yes + state.beardVotes.no;
  const voteRatio =
    totalVotes > 0
      ? (state.beardVotes.yes - state.beardVotes.no) / totalVotes
      : 0;
  const shipProgress = Math.min(state.shipTaps / SHIP_GOAL, 1);

  const canPrev = state.currentSlide > 0;
  const canNext = state.currentSlide < SLIDES.length - 1;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LiquidBackground />
        <motion.p
          className="font-serif text-2xl text-white/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Загрузка...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <LiquidBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* ── Top bar ────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">
            Режим ведущего
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-white/50">
              Участники:{" "}
              <span className="text-amber-300">{state.activeUsers}</span>
            </span>
            <GooeyButton variant="danger" onClick={reset} className="text-xs px-3 py-1.5">
              Сброс
            </GooeyButton>
          </div>
        </div>

        {/* ── Main content area ──────────────────── */}
        <div className="flex flex-1 gap-8">
          {/* Left: slide content */}
          <div className="flex flex-1 flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="flex-1"
              >
                <GlassCard className="h-full p-8" glow={slide.type === "wait" ? 0.6 : 0.2}>
                  {/* Slide number */}
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-white/30">
                    {slide.type === "wait"
                      ? "Ожидание"
                      : `Слайд ${slide.id} / ${SLIDES.length - 1}`}
                  </p>

                  {/* Title */}
                  <h1 className="mb-2 font-serif text-4xl font-bold leading-tight tracking-tight text-white/90 md:text-5xl">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mb-6 text-lg text-amber-300/80">{slide.subtitle}</p>
                  )}

                  {slide.body && (
                    <p className="mb-8 max-w-2xl leading-relaxed text-white/60">
                      {slide.body}
                    </p>
                  )}

                  {/* ── Activity: Ships ───────────── */}
                  {slide.type === "activity_ships" && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-end justify-between">
                        <p className="font-mono text-sm text-white/40">
                          Прогресс верфи
                        </p>
                        <p className="font-mono text-2xl text-amber-300">
                          {state.shipTaps}{" "}
                          <span className="text-sm text-white/30">/ {SHIP_GOAL}</span>
                        </p>
                      </div>
                      {/* Liquid progress bar */}
                      <div className="relative h-6 overflow-hidden rounded-full bg-white/5 border border-white/10">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa)",
                          }}
                          animate={{ width: `${shipProgress * 100}%` }}
                          transition={{ type: "spring", stiffness: 80, damping: 20 }}
                        />
                        {/* Shine */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                      </div>
                      {shipProgress >= 1 && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center font-serif text-xl text-amber-300"
                        >
                          Флот построен!
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* ── Activity: Beard Vote ─────── */}
                  {slide.type === "activity_beard" && (
                    <div className="mt-4 space-y-4">
                      <div className="flex gap-6">
                        <GlassCard className="flex-1 p-4 text-center">
                          <p className="font-mono text-xs text-white/40 mb-1">
                            Сбрить
                          </p>
                          <p className="font-serif text-3xl text-green-400">
                            {state.beardVotes.yes}
                          </p>
                        </GlassCard>
                        <GlassCard className="flex-1 p-4 text-center">
                          <p className="font-mono text-xs text-white/40 mb-1">
                            Заплатить налог
                          </p>
                          <p className="font-serif text-3xl text-red-400">
                            {state.beardVotes.no}
                          </p>
                        </GlassCard>
                      </div>
                      {totalVotes > 0 && (
                        <div className="relative h-4 overflow-hidden rounded-full bg-white/5 border border-white/10">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                            animate={{
                              width: `${(state.beardVotes.yes / totalVotes) * 100}%`,
                            }}
                            transition={{ type: "spring", stiffness: 80 }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Host instruction */}
                  {slide.hostInstruction && (
                    <p className="mt-8 border-t border-white/5 pt-4 font-mono text-xs text-white/30">
                      {slide.hostInstruction}
                    </p>
                  )}
                </GlassCard>
              </motion.div>
            </AnimatePresence>

            {/* ── Navigation ─────────────────────── */}
            <div className="mt-6 flex items-center justify-between">
              <GooeyButton
                variant="silver"
                disabled={!canPrev}
                onClick={() => setSlide(state.currentSlide - 1)}
              >
                Назад
              </GooeyButton>

              <div className="flex gap-2">
                {SLIDES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSlide(s.id)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      s.id === state.currentSlide
                        ? "w-8 bg-amber-400"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <GooeyButton
                variant="gold"
                disabled={!canNext}
                onClick={() => setSlide(state.currentSlide + 1)}
              >
                Далее
              </GooeyButton>
            </div>
          </div>

          {/* Right: Liquid Blob */}
          <div className="hidden flex-col items-center justify-center lg:flex">
            <LiquidBlob
              progress={shipProgress}
              voteRatio={voteRatio}
              size={1}
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-white/20">
              Состояние Империи
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
