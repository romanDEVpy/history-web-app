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
import WaveProgress from "./WaveProgress";
import AnimatedCounter from "./AnimatedCounter";
import MorphingSVG from "./MorphingSVG";
import { motion, AnimatePresence } from "framer-motion";

const SHIP_GOAL = 200;
const CITY_GOAL = 500;

const RANKS_DATA = [
  { rank: "I", title: "Канцлер / Генерал-фельдмаршал", color: "text-amber-300" },
  { rank: "III", title: "Тайный советник / Генерал-лейтенант", color: "text-amber-200" },
  { rank: "V", title: "Статский советник / Бригадир", color: "text-slate-200" },
  { rank: "VIII", title: "Коллежский асессор / Майор", color: "text-slate-300" },
  { rank: "X", title: "Коллежский секретарь / Капитан", color: "text-slate-400" },
  { rank: "XIV", title: "Коллежский регистратор / Прапорщик", color: "text-slate-500" },
];

const IND_LABELS = ["Металлургия", "Текстиль", "Кораблестроение", "Стекло"];
const IND_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

export default function HostDashboard() {
  const { state, loading, setSlide, reset } = useSessionState(800);
  const slide = SLIDES[state.currentSlide] ?? SLIDES[0];
  const totalVotes = state.beardVotes.yes + state.beardVotes.no;
  const voteRatio = totalVotes > 0 ? (state.beardVotes.yes - state.beardVotes.no) / totalVotes : 0;
  const shipProgress = Math.min(state.shipTaps / SHIP_GOAL, 1);
  const cityProgress = Math.min(state.cityTaps / CITY_GOAL, 1);
  const overallProgress = state.currentSlide / Math.max(SLIDES.length - 1, 1);

  const canPrev = state.currentSlide > 0;
  const canNext = state.currentSlide < SLIDES.length - 1;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LiquidBackground />
        <ParticleField count={30} color="rgba(59,130,246,0.4)" />
        <motion.div className="text-center" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <MorphingSVG variant="crown" className="mx-auto mb-4 h-20 w-20" color="rgba(245,158,11,0.4)" />
          <p className="font-serif text-2xl text-white/60">Загрузка...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <LiquidBackground />
      <ParticleField count={25} color="rgba(161,130,50,0.15)" speed={0.5} />
      <FloatingIcons icon={slide.icon} count={10} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="h-2 w-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">Режим ведущего</p>
          </div>
          <div className="flex items-center gap-4">
            <GlassCard className="px-3 py-1.5">
              <span className="font-mono text-xs text-white/50">Участники: <AnimatedCounter value={state.activeUsers} className="text-amber-300 font-bold" /></span>
            </GlassCard>
            <GlassCard className="px-3 py-1.5">
              <span className="font-mono text-xs text-white/50">Слайд {state.currentSlide}/{SLIDES.length - 1}</span>
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
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-3 inline-block rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-0.5">
                      <span className="font-mono text-xs font-bold text-amber-300">{slide.year}</span>
                    </motion.div>
                  )}
                  <motion.h1 className="mb-2 font-serif text-4xl font-bold leading-tight tracking-tight text-white/90 md:text-5xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    {slide.title}
                  </motion.h1>
                  {slide.subtitle && <motion.p className="mb-4 text-lg text-amber-300/80" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>{slide.subtitle}</motion.p>}
                  {slide.body && <motion.p className="mb-6 max-w-2xl leading-relaxed text-white/60" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>{slide.body}</motion.p>}
                  {slide.facts && slide.facts.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {slide.facts.map((fact, i) => (
                        <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.08 }} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400/50" />
                          <span className="text-sm text-white/40">{fact}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <HostSlideContent slide={slide} state={state} shipProgress={shipProgress} cityProgress={cityProgress} totalVotes={totalVotes} />
                  {slide.hostInstruction && <motion.p className="mt-6 border-t border-white/5 pt-4 font-mono text-xs text-white/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>{slide.hostInstruction}</motion.p>}
                </GlassCard>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-4 flex items-center justify-between">
              <GooeyButton variant="silver" disabled={!canPrev} onClick={() => setSlide(state.currentSlide - 1)}>Назад</GooeyButton>
              <div className="flex gap-1.5">
                {SLIDES.map((s) => (
                  <motion.button key={s.id} onClick={() => setSlide(s.id)}
                    className={`rounded-full transition-all duration-300 ${s.id === state.currentSlide ? "h-2.5 w-8 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : s.id < state.currentSlide ? "h-2 w-2 bg-amber-400/40" : "h-2 w-2 bg-white/15 hover:bg-white/30"}`}
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
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/20">Состояние Империи</p>
            <GlassCard className="w-full p-4 space-y-3">
              <StatRow label="Удары (флот)" value={state.shipTaps} max={SHIP_GOAL} color="#3b82f6" />
              <StatRow label="Камни (город)" value={state.cityTaps} max={CITY_GOAL} color="#22c55e" />
              <StatRow label="Голоса (борода)" value={totalVotes} color="#f59e0b" />
              <StatRow label="Ответы (квиз)" value={state.quiz.total} color="#a855f7" />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide-specific visuals ─────────────────────────────────────── */

function HostSlideContent({ slide, state, shipProgress, cityProgress, totalVotes }: {
  slide: SlideData; state: ReturnType<typeof useSessionState>["state"]; shipProgress: number; cityProgress: number; totalVotes: number;
}) {
  if (slide.type === "wait") return (
    <div className="flex items-center justify-center py-8">
      <motion.div className="h-24 w-24 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #3b82f6, #1e3a8a, #0f172a)", boxShadow: "0 0 60px rgba(59,130,246,0.2)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );

  if (slide.type === "activity_ships") return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <p className="font-mono text-sm text-white/40">Прогресс верфи</p>
        <p className="font-mono text-2xl text-amber-300"><AnimatedCounter value={state.shipTaps} className="text-amber-300" /> <span className="text-sm text-white/30">/ {SHIP_GOAL}</span></p>
      </div>
      <WaveProgress progress={shipProgress} color="#3b82f6" height={80} label={shipProgress >= 1 ? "Флот построен!" : `${Math.round(shipProgress * 100)}%`} />
      <div className="flex gap-2">{Array.from({ length: Math.min(Math.floor(state.shipTaps / 40), 5) }).map((_, i) => (
        <motion.span key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.1, type: "spring" }} className="text-2xl">⛵</motion.span>
      ))}</div>
    </div>
  );

  if (slide.type === "activity_beard") return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <GlassCard className="flex-1 p-4 text-center"><p className="font-mono text-xs text-white/40 mb-1">Сбрить</p><p className="font-serif text-3xl text-green-400"><AnimatedCounter value={state.beardVotes.yes} className="text-green-400" /></p></GlassCard>
        <GlassCard className="flex-1 p-4 text-center"><p className="font-mono text-xs text-white/40 mb-1">Заплатить</p><p className="font-serif text-3xl text-red-400"><AnimatedCounter value={state.beardVotes.no} className="text-red-400" /></p></GlassCard>
      </div>
      {totalVotes > 0 && (
        <div className="relative h-5 overflow-hidden rounded-full bg-white/5 border border-white/10">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 to-green-400" animate={{ width: `${(state.beardVotes.yes / totalVotes) * 100}%` }} transition={{ type: "spring", stiffness: 80 }} />
        </div>
      )}
    </div>
  );

  if (slide.type === "activity_senate") {
    const avg = state.senate.average;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><span className="font-mono text-sm text-white/40">Народ</span><span className="font-mono text-sm text-white/40">Монарх</span></div>
        <div className="relative h-8 rounded-full bg-white/5 border border-white/10 overflow-hidden">
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)" }} animate={{ width: `${avg}%` }} transition={{ type: "spring", stiffness: 60 }} />
          <div className="absolute inset-0 flex items-center justify-center"><span className="font-mono text-xs font-bold text-white/80 drop-shadow-lg">{avg}%</span></div>
        </div>
        <p className="text-center font-mono text-xs text-white/30">Ответили: <AnimatedCounter value={state.senate.count} className="text-amber-300" /> чел.</p>
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
          <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
            <motion.div className="absolute inset-y-0 left-0 rounded-xl" style={{ background: opt.correct ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)" }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} />
            <div className="relative flex items-center justify-between">
              <span className={`text-sm ${opt.correct ? "text-green-400" : "text-white/60"}`}>{opt.correct && "✓ "}{opt.label}</span>
              <span className="font-mono text-xs text-white/40">{count} ({Math.round(pct)}%)</span>
            </div>
          </div>
        );
      })}</div>
    );
  }

  if (slide.type === "info_calendar") return (
    <div className="flex items-center justify-center gap-8 py-4">
      <GlassCard className="p-4 text-center"><motion.p className="font-serif text-4xl text-red-400/80" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 3, repeat: Infinity }}>7208</motion.p><p className="font-mono text-[10px] text-white/30 mt-1">от сотворения мира</p></GlassCard>
      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-3xl opacity-40">⟳</motion.div>
      <GlassCard className="p-4 text-center" glow={0.5}><motion.p className="font-serif text-4xl text-amber-300" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>1700</motion.p><p className="font-mono text-[10px] text-white/30 mt-1">от Рождества Христова</p></GlassCard>
    </div>
  );

  if (slide.type === "activity_city") return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <p className="font-mono text-sm text-white/40">Строительство</p>
        <p className="font-mono text-2xl text-green-400"><AnimatedCounter value={state.cityTaps} className="text-green-400" /> <span className="text-sm text-white/30">/ {CITY_GOAL}</span></p>
      </div>
      <WaveProgress progress={cityProgress} color="#22c55e" height={80} label={cityProgress >= 1 ? "Город построен!" : `${Math.round(cityProgress * 100)}%`} />
      <div className="flex gap-1">{Array.from({ length: Math.min(Math.floor(state.cityTaps / 50), 10) }).map((_, i) => (
        <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05, type: "spring" }}
          className="h-6 flex-1 rounded-t-sm border border-white/10" style={{ background: `linear-gradient(180deg, rgba(34,197,94,${0.15 + i * 0.03}), rgba(34,197,94,0.05))` }} />
      ))}</div>
    </div>
  );

  if (slide.type === "activity_industry") {
    const total = state.industry.total;
    return (
      <div className="space-y-3">{IND_LABELS.map((label, i) => {
        const count = state.industry.options[i] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
            <motion.div className="absolute inset-y-0 left-0 rounded-xl" style={{ background: `${IND_COLORS[i]}22` }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} />
            <div className="relative flex items-center justify-between">
              <span className="text-sm text-white/70">{label}</span>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full" style={{ background: IND_COLORS[i] }} /><span className="font-mono text-xs text-white/40">{count} ({Math.round(pct)}%)</span></div>
            </div>
          </div>
        );
      })}</div>
    );
  }

  if (slide.type === "info_ranks") return (
    <div className="space-y-2">{RANKS_DATA.map((r, i) => (
      <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2">
        <span className={`font-serif text-lg font-bold ${r.color}`}>{r.rank}</span>
        <div className="h-4 w-px bg-white/10" /><span className="text-sm text-white/50">{r.title}</span>
      </motion.div>
    ))}</div>
  );

  if (slide.type === "finale") return (
    <div className="flex flex-col items-center gap-4 py-4">
      <MorphingSVG variant="crown" className="h-28 w-28" color="rgba(245,158,11,0.3)" />
      <motion.p className="text-center font-serif text-xl text-amber-300/80" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>Россия провозглашена Империей</motion.p>
      <div className="flex gap-6 text-center">
        <div><p className="font-serif text-2xl text-blue-400"><AnimatedCounter value={48} className="text-blue-400" /></p><p className="font-mono text-[10px] text-white/30">кораблей</p></div>
        <div><p className="font-serif text-2xl text-green-400"><AnimatedCounter value={200} className="text-green-400" /></p><p className="font-mono text-[10px] text-white/30">мануфактур</p></div>
        <div><p className="font-serif text-2xl text-amber-400"><AnimatedCounter value={14} className="text-amber-400" /></p><p className="font-mono text-[10px] text-white/30">рангов</p></div>
      </div>
    </div>
  );

  return null;
}

function StatRow({ label, value, max, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = max ? Math.min((value / max) * 100, 100) : Math.min(value * 5, 100);
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="font-mono text-[10px] text-white/30">{label}</span><span className="font-mono text-[10px] text-white/50">{value}{max ? `/${max}` : ""}</span></div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} /></div>
    </div>
  );
}
