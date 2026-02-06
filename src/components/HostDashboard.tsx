"use client";

import { useSessionState } from "@/lib/useSessionState";
import { SLIDES, type SlideData } from "@/lib/slides";
import GlassCard from "./GlassCard";
import GooeyButton from "./GooeyButton";
import LiquidBlob from "./LiquidBlob";
import LiquidBackground from "./LiquidBackground";
import ParticleField from "./ParticleField";
import FloatingIcons from "./FloatingIcons";
import TimelineBar from "./TimelineBar";
import AnimatedCounter from "./AnimatedCounter";
import MorphingSVG from "./MorphingSVG";
import { motion, AnimatePresence } from "framer-motion";


const RANKS_DATA = [
  { rank: "I", title: "Канцлер / Генерал-фельдмаршал", color: "text-amber-600" },
  { rank: "III", title: "Тайный советник / Генерал-лейтенант", color: "text-amber-500" },
  { rank: "V", title: "Статский советник / Бригадир", color: "text-slate-600" },
  { rank: "VIII", title: "Коллежский асессор / Майор", color: "text-slate-500" },
  { rank: "X", title: "Коллежский секретарь / Капитан", color: "text-slate-500" },
  { rank: "XIV", title: "Коллежский регистратор / Прапорщик", color: "text-slate-400" },
];

const IND_LABELS = ["Учреждение Сената", "Система коллегий", "Губернская реформа", "Табель о рангах"];
const IND_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

export default function HostDashboard() {
  const { state, loading, setSlide, reset } = useSessionState(800);
  const slide = SLIDES[state.currentSlide] ?? SLIDES[0];
  const totalVotes = state.beardVotes.yes + state.beardVotes.no;
  const voteRatio = totalVotes > 0 ? (state.beardVotes.yes - state.beardVotes.no) / totalVotes : 0;
  const overallProgress = state.currentSlide / Math.max(SLIDES.length - 1, 1);

  const canPrev = state.currentSlide > 0;
  const canNext = state.currentSlide < SLIDES.length - 1;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LiquidBackground />
        <ParticleField count={30} color="rgba(59,130,246,0.2)" />
        <motion.div className="text-center" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <MorphingSVG variant="crown" className="mx-auto mb-4 h-20 w-20" color="rgba(245,158,11,0.4)" />
          <p className="font-serif text-2xl text-slate-400">Загрузка...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800">
      <LiquidBackground />
      <ParticleField count={25} color="rgba(161,130,50,0.08)" speed={0.5} />
      <FloatingIcons icon={slide.icon} count={10} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="h-2 w-2 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Режим ведущего</p>
          </div>
          <div className="flex items-center gap-4">
            <GlassCard className="px-3 py-1.5">
              <span className="font-mono text-xs text-slate-500">Участники: <AnimatedCounter value={state.activeUsers} className="text-amber-600 font-bold" /></span>
            </GlassCard>
            <GlassCard className="px-3 py-1.5">
              <span className="font-mono text-xs text-slate-500">Слайд {state.currentSlide}/{SLIDES.length - 1}</span>
            </GlassCard>
            <GooeyButton variant="danger" onClick={reset} className="text-xs px-3 py-1.5">Сброс</GooeyButton>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6"><TimelineBar currentSlide={state.currentSlide} /></div>

        {/* Main */}
        <div className="flex flex-1 gap-6">
          <div className="flex flex-1 flex-col min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.97 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1"
              >
                <GlassCard className="h-full p-8" glow={slide.type === "wait" || slide.type === "finale" ? 0.6 : 0.2}>
                  {slide.year && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-0.5">
                      <span className="font-mono text-xs font-bold text-amber-600">{slide.year}</span>
                    </motion.div>
                  )}
                  <motion.h1 className="mb-2 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-800 md:text-5xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    {slide.title}
                  </motion.h1>
                  {slide.subtitle && <motion.p className="mb-4 text-lg text-amber-600/80" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>{slide.subtitle}</motion.p>}
                  {slide.body && <motion.p className="mb-6 max-w-2xl leading-relaxed text-slate-500" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>{slide.body}</motion.p>}
                  {slide.facts && slide.facts.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {slide.facts.map((fact, i) => (
                        <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.08 }} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500/50" />
                          <span className="text-sm text-slate-500">{fact}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <HostSlideContent slide={slide} state={state} totalVotes={totalVotes} />
                </GlassCard>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-4 flex items-center justify-between">
              <GooeyButton variant="silver" disabled={!canPrev} onClick={() => setSlide(state.currentSlide - 1)}>Назад</GooeyButton>
              <div className="flex gap-1.5">
                {SLIDES.map((s) => (
                  <motion.button key={s.id} onClick={() => setSlide(s.id)}
                    className={`rounded-full transition-all duration-300 ${s.id === state.currentSlide ? "h-2.5 w-8 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : s.id < state.currentSlide ? "h-2 w-2 bg-amber-500/40" : "h-2 w-2 bg-slate-300 hover:bg-slate-400"}`}
                    whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
              <GooeyButton variant="gold" disabled={!canNext} onClick={() => setSlide(state.currentSlide + 1)}>Далее</GooeyButton>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden w-72 flex-col items-center justify-center gap-6 lg:flex">
            <motion.div animate={{ rotate: [0, 1, -1, 0] }} transition={{ duration: 20, repeat: Infinity }}>
              <LiquidBlob progress={overallProgress} voteRatio={voteRatio} size={0.9} />
            </motion.div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Состояние реформы</p>
            <GlassCard className="w-full p-4 space-y-3">
              <StatRow label="Пазл (губернии)" value={state.shipTaps} color="#3b82f6" />
              <StatRow label="Пазл (регламент)" value={state.cityTaps} color="#22c55e" />
              <StatRow label="Голоса (назначение)" value={totalVotes} color="#f59e0b" />
              <StatRow label="Ответы (квиз)" value={state.quiz.total} color="#a855f7" />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide-specific visuals ─────────────────────────────────────── */

function HostSlideContent({ slide, state, totalVotes }: {
  slide: SlideData; state: ReturnType<typeof useSessionState>["state"]; totalVotes: number;
}) {
  if (slide.type === "wait") return (
    <div className="flex items-center justify-center py-8">
      <motion.div className="h-24 w-24 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6, #93c5fd)", boxShadow: "0 0 60px rgba(59,130,246,0.15)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );

  if (slide.type === "activity_ships") return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <p className="font-mono text-sm text-slate-400">Головоломка: Губернии</p>
        <p className="font-mono text-2xl text-amber-600"><AnimatedCounter value={state.shipTaps} className="text-amber-600" /> <span className="text-sm text-slate-400">решили</span></p>
      </div>
      <div className="flex items-center gap-4 py-4">
        <MorphingSVG variant="ship" className="h-20 w-20 opacity-30" color="#3b82f6" />
        <div className="flex-1">
          <p className="font-mono text-xs text-slate-400 mb-2">Участники собирают блоки</p>
          <div className="flex gap-1 flex-wrap">{Array.from({ length: Math.min(state.shipTaps, 20) }).map((_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05, type: "spring" }} className="text-lg">🏛️</motion.span>
          ))}</div>
        </div>
      </div>
    </div>
  );

  if (slide.type === "activity_beard") return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <GlassCard className="flex-1 p-4 text-center"><p className="font-mono text-xs text-slate-400 mb-1">По заслугам</p><p className="font-serif text-3xl text-green-600"><AnimatedCounter value={state.beardVotes.yes} className="text-green-600" /></p></GlassCard>
        <GlassCard className="flex-1 p-4 text-center"><p className="font-mono text-xs text-slate-400 mb-1">По знатности</p><p className="font-serif text-3xl text-red-500"><AnimatedCounter value={state.beardVotes.no} className="text-red-500" /></p></GlassCard>
      </div>
      {totalVotes > 0 && (
        <div className="relative h-5 overflow-hidden rounded-full bg-black/[0.04] border border-slate-200">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 to-green-400" animate={{ width: `${(state.beardVotes.yes / totalVotes) * 100}%` }} transition={{ type: "spring", stiffness: 80 }} />
        </div>
      )}
    </div>
  );

  if (slide.type === "activity_senate") {
    const avg = state.senate.average;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><span className="font-mono text-sm text-slate-400">Народ</span><span className="font-mono text-sm text-slate-400">Монарх</span></div>
        <div className="relative h-8 rounded-full bg-black/[0.04] border border-slate-200 overflow-hidden">
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)" }} animate={{ width: `${avg}%` }} transition={{ type: "spring", stiffness: 60 }} />
          <div className="absolute inset-0 flex items-center justify-center"><span className="font-mono text-xs font-bold text-white drop-shadow-lg">{avg}%</span></div>
        </div>
        <p className="text-center font-mono text-xs text-slate-400">Ответили: <AnimatedCounter value={state.senate.count} className="text-amber-600" /> чел.</p>
      </div>
    );
  }

  if (slide.type === "quiz_alphabet") {
    const opts = slide.quizOptions ?? [];
    const total = state.quiz.total;
    return (
      <div className="space-y-3">{opts.map((opt, i) => {
        const count = state.quiz.options[i] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200 bg-black/[0.04] p-3">
            <motion.div className="absolute inset-y-0 left-0 rounded-xl" style={{ background: "rgba(0,0,0,0.04)" }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} />
            <div className="relative flex items-center justify-between">
              <span className="text-sm text-slate-600">{opt.label}</span>
              <span className="font-mono text-xs text-slate-400">{count} ({Math.round(pct)}%)</span>
            </div>
          </div>
        );
      })}</div>
    );
  }

  if (slide.type === "info_calendar") return (
    <div className="flex items-center justify-center gap-8 py-4">
      <GlassCard className="p-4 text-center"><motion.p className="font-serif text-3xl text-red-400/80 line-through" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity }}>Патриарх</motion.p><p className="font-mono text-[10px] text-slate-400 mt-1">единоличная власть</p></GlassCard>
      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-3xl opacity-40">⟳</motion.div>
      <GlassCard className="p-4 text-center" glow={0.5}><motion.p className="font-serif text-3xl text-amber-600" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>Синод</motion.p><p className="font-mono text-[10px] text-slate-400 mt-1">государственный контроль</p></GlassCard>
    </div>
  );

  if (slide.type === "activity_city") return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <p className="font-mono text-sm text-slate-400">Головоломка: Регламент</p>
        <p className="font-mono text-2xl text-green-600"><AnimatedCounter value={state.cityTaps} className="text-green-600" /> <span className="text-sm text-slate-400">решили</span></p>
      </div>
      <div className="flex items-center gap-4 py-4">
        <MorphingSVG variant="city" className="h-20 w-20 opacity-30" color="#22c55e" />
        <div className="flex-1">
          <p className="font-mono text-xs text-slate-400 mb-2">Участники собирают блоки</p>
          <div className="flex gap-1 flex-wrap">{Array.from({ length: Math.min(state.cityTaps, 20) }).map((_, i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05, type: "spring" }}
              className="h-6 w-6 rounded-sm border border-slate-200" style={{ background: `linear-gradient(180deg, rgba(34,197,94,${0.2 + i * 0.02}), rgba(34,197,94,0.05))` }} />
          ))}</div>
        </div>
      </div>
    </div>
  );

  if (slide.type === "activity_industry") {
    const total = state.industry.total;
    return (
      <div className="space-y-3">{IND_LABELS.map((label, i) => {
        const count = state.industry.options[i] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200 bg-black/[0.04] p-3">
            <motion.div className="absolute inset-y-0 left-0 rounded-xl" style={{ background: `${IND_COLORS[i]}22` }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} />
            <div className="relative flex items-center justify-between">
              <span className="text-sm text-slate-600">{label}</span>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full" style={{ background: IND_COLORS[i] }} /><span className="font-mono text-xs text-slate-400">{count} ({Math.round(pct)}%)</span></div>
            </div>
          </div>
        );
      })}</div>
    );
  }

  if (slide.type === "info_ranks") return (
    <div className="space-y-2">{RANKS_DATA.map((r, i) => (
      <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-black/[0.02] px-4 py-2">
        <span className={`font-serif text-lg font-bold ${r.color}`}>{r.rank}</span>
        <div className="h-4 w-px bg-slate-200" /><span className="text-sm text-slate-500">{r.title}</span>
      </motion.div>
    ))}</div>
  );

  if (slide.type === "finale") return (
    <div className="flex flex-col items-center gap-4 py-4">
      <MorphingSVG variant="crown" className="h-28 w-28" color="rgba(245,158,11,0.3)" />
      <motion.p className="text-center font-serif text-xl text-amber-600/80" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>От приказов — к регулярному государству</motion.p>
      <div className="flex gap-6 text-center">
        <div><p className="font-serif text-2xl text-blue-600"><AnimatedCounter value={12} className="text-blue-600" /></p><p className="font-mono text-[10px] text-slate-400">коллегий</p></div>
        <div><p className="font-serif text-2xl text-green-600"><AnimatedCounter value={8} className="text-green-600" /></p><p className="font-mono text-[10px] text-slate-400">губерний</p></div>
        <div><p className="font-serif text-2xl text-amber-600"><AnimatedCounter value={14} className="text-amber-600" /></p><p className="font-mono text-[10px] text-slate-400">рангов</p></div>
      </div>
    </div>
  );

  return null;
}

function StatRow({ label, value, max, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = max ? Math.min((value / max) * 100, 100) : Math.min(value * 5, 100);
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="font-mono text-[10px] text-slate-400">{label}</span><span className="font-mono text-[10px] text-slate-500">{value}{max ? `/${max}` : ""}</span></div>
      <div className="h-1 rounded-full bg-black/[0.04] overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} /></div>
    </div>
  );
}
