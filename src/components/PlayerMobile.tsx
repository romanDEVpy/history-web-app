"use client";

import { useSessionState } from "@/lib/useSessionState";
import { SLIDES } from "@/lib/slides";
import GlassCard from "./GlassCard";
import GooeyButton from "./GooeyButton";
import LiquidBackground from "./LiquidBackground";
import ParticleField from "./ParticleField";
import MorphingSVG from "./MorphingSVG";
import BlockPuzzle from "./BlockPuzzle";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const IND_LABELS = ["Учреждение Сената", "Система коллегий", "Губернская реформа", "Табель о рангах"];
const IND_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

export default function PlayerMobile() {
  const { state, loading } = useSessionState(1000);
  const slide = SLIDES[state.currentSlide] ?? SLIDES[0];
  const [joined, setJoined] = useState(false);
  const hasJoinedRef = useRef(false);

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
        <ParticleField count={20} color="rgba(59,130,246,0.15)" />
        <motion.div className="text-center" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <MorphingSVG variant="crown" className="mx-auto mb-4 h-16 w-16" color="rgba(245,158,11,0.3)" />
          <p className="font-serif text-xl text-slate-400">Подключение...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col text-slate-800">
      <LiquidBackground />
      <ParticleField count={15} color="rgba(161,130,50,0.08)" speed={0.4} />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-6 safe-area-inset">
        {/* Status bar */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Участник</p>
          <div className="flex items-center gap-2">
            <motion.div className="h-1.5 w-1.5 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="rounded-full bg-black/[0.04] px-3 py-1 font-mono text-[10px] text-slate-500 border border-slate-200">
              {state.activeUsers} онлайн
            </span>
          </div>
        </div>

        {/* Slide indicator */}
        <div className="mb-3 flex gap-1">
          {SLIDES.map((s) => (
            <div key={s.id} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${s.id <= state.currentSlide ? "bg-amber-500/60" : "bg-black/[0.06]"}`} />
          ))}
        </div>

        {/* Main */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            {slide.type === "wait" && <WaitView />}
            {slide.type === "info" && <InfoView slide={slide} />}
            {slide.type === "activity_ships" && <BlockPuzzle endpoint="/api/tap" title="Губернская реформа" subtitle="Соберите линии — постройте новую административную карту!" themeColor="#3b82f6" total={state.shipTaps} goal={3} />}
            {slide.type === "activity_beard" && <BeardActivity votes={state.beardVotes} />}
            {slide.type === "activity_senate" && <SenateActivity senate={state.senate} />}
            {slide.type === "quiz_alphabet" && <QuizActivity slide={slide} quiz={state.quiz} endpoint="/api/quiz" />}
            {slide.type === "info_calendar" && <CalendarView />}
            {slide.type === "activity_city" && <BlockPuzzle endpoint="/api/city" title="Генеральный регламент" subtitle="Соберите линии — выстройте систему госслужбы!" themeColor="#22c55e" total={state.cityTaps} goal={3} />}
            {slide.type === "activity_industry" && <IndustryActivity industry={state.industry} />}
            {slide.type === "info_ranks" && <InfoView slide={slide} />}
            {slide.type === "finale" && <FinaleView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Sub-views ────────────────────────────────────────────────────── */

function WaitView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <motion.div className="mb-8 h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6, #93c5fd)", boxShadow: "0 0 80px rgba(59,130,246,0.15)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7], borderRadius: ["50%", "45% 55% 60% 40%", "50%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <h2 className="mb-2 font-serif text-2xl text-slate-700">Реформа управления</h2>
      <p className="font-mono text-sm text-slate-400">Ожидание начала...</p>
      <motion.div className="mt-6 flex gap-1" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="h-2 w-2 rounded-full bg-amber-500/50" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </motion.div>
    </div>
  );
}

function InfoView({ slide }: { slide: { title: string; subtitle?: string; body?: string; facts?: string[]; year?: string } }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-2">
      <GlassCard className="w-full max-w-sm p-6" glow={0.3}>
        {slide.year && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-0.5">
            <span className="font-mono text-xs font-bold text-amber-600">{slide.year}</span>
          </motion.div>
        )}
        <h2 className="mb-2 font-serif text-2xl font-bold text-slate-800">{slide.title}</h2>
        {slide.subtitle && <p className="mb-4 text-sm text-amber-600/70">{slide.subtitle}</p>}
        {slide.body && <p className="text-sm leading-relaxed text-slate-500 mb-4">{slide.body}</p>}
        {slide.facts && (
          <div className="space-y-2 text-left">
            {slide.facts.map((f, i) => (
              <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500/40" />
                <span className="text-xs text-slate-500">{f}</span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}


function BeardActivity({ votes }: { votes: { yes: number; no: number } }) {
  const [voted, setVoted] = useState(false);
  const castVote = async (yes: boolean) => {
    if (voted) return;
    setVoted(true);
    await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ yes }) });
  };
  const total = votes.yes + votes.no;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2">
      <h2 className="font-serif text-xl text-slate-700">Принцип назначения</h2>
      <p className="text-center text-sm text-slate-500">По заслугам — или по знатности рода?</p>
      {!voted ? (
        <div className="flex w-full max-w-xs gap-4">
          <GooeyButton variant="gold" className="flex-1 py-6 text-lg" onClick={() => castVote(true)}>⚖️ По заслугам</GooeyButton>
          <GooeyButton variant="silver" className="flex-1 py-6 text-lg" onClick={() => castVote(false)}>👑 По знатности</GooeyButton>
        </div>
      ) : (
        <GlassCard className="w-full max-w-xs p-6 text-center" glow={0.4}>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4 font-mono text-sm text-amber-600">Ваш голос учтён!</motion.p>
          <div className="flex justify-around">
            <div><p className="font-mono text-xs text-slate-400">Заслуги</p><p className="font-serif text-2xl text-green-600">{votes.yes}</p></div>
            <div><p className="font-mono text-xs text-slate-400">Знатность</p><p className="font-serif text-2xl text-red-500">{votes.no}</p></div>
          </div>
          {total > 0 && (
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/[0.04] border border-slate-200">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" initial={{ width: 0 }} animate={{ width: `${(votes.yes / total) * 100}%` }} transition={{ type: "spring", stiffness: 80 }} />
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

function SenateActivity({ senate }: { senate: { average: number; count: number } }) {
  const [submitted, setSubmitted] = useState(false);
  const [value, setValue] = useState(50);

  const submit = async () => {
    if (submitted) return;
    setSubmitted(true);
    await fetch("/api/senate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2">
      <h2 className="font-serif text-xl text-slate-700">Власть монарха</h2>
      <p className="text-center text-sm text-slate-500">Сколько власти должен иметь царь?</p>
      {!submitted ? (
        <div className="w-full max-w-xs space-y-6">
          <div className="flex justify-between font-mono text-xs text-slate-500">
            <span>Народ</span><span>Монарх</span>
          </div>
          <div className="relative">
            <input type="range" min={0} max={100} value={value} onChange={(e) => setValue(Number(e.target.value))}
              className="slider-liquid w-full h-3 appearance-none rounded-full bg-slate-200 outline-none cursor-pointer"
              style={{ background: `linear-gradient(90deg, #3b82f6 ${value}%, rgba(0,0,0,0.06) ${value}%)` }}
            />
          </div>
          <p className="text-center font-serif text-3xl text-amber-600">{value}%</p>
          <GooeyButton variant="gold" className="w-full py-4" onClick={submit}>⚖️ Отправить</GooeyButton>
        </div>
      ) : (
        <GlassCard className="w-full max-w-xs p-6 text-center" glow={0.4}>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-3 font-mono text-sm text-amber-600">Голос учтён!</motion.p>
          <p className="font-mono text-xs text-slate-400 mb-2">Среднее мнение</p>
          <p className="font-serif text-4xl text-amber-600">{senate.average}%</p>
          <p className="mt-2 font-mono text-xs text-slate-400">Ответили: {senate.count} чел.</p>
        </GlassCard>
      )}
    </div>
  );
}

function QuizActivity({ slide, quiz, endpoint }: {
  slide: { quizOptions?: { label: string; correct?: boolean }[] };
  quiz: { options: number[]; total: number };
  endpoint: string;
}) {
  const [answered, setAnswered] = useState<number | null>(null);
  const opts = slide.quizOptions ?? [];

  const answer = async (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option: i }) });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2">
      <h2 className="font-serif text-xl text-slate-700">Выберите ответ</h2>
      <div className="w-full max-w-sm space-y-3">
        {opts.map((opt, i) => {
          const isChosen = answered === i;
          const showResult = answered !== null;
          const isCorrect = opt.correct;
          return (
            <motion.button key={i} onClick={() => answer(i)} disabled={answered !== null}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                showResult ? (isCorrect ? "border-green-500/50 bg-green-500/10" : isChosen ? "border-red-400/50 bg-red-400/10" : "border-slate-200 bg-black/[0.02]")
                : "border-slate-200 bg-black/[0.04] active:bg-black/[0.06]"
              }`}
              whileTap={answered === null ? { scale: 0.97 } : {}}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
            >
              {showResult && (
                <motion.div className="absolute inset-y-0 left-0" style={{ background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.02)" }}
                  initial={{ width: 0 }} animate={{ width: `${quiz.total > 0 ? (quiz.options[i] / quiz.total) * 100 : 0}%` }} transition={{ type: "spring", stiffness: 60 }} />
              )}
              <div className="relative flex items-center justify-between">
                <span className={`text-sm ${showResult && isCorrect ? "text-green-600 font-bold" : "text-slate-600"}`}>
                  {showResult && isCorrect && "✓ "}{opt.label}
                </span>
                {showResult && <span className="font-mono text-xs text-slate-400">{quiz.options[i]}</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center gap-6 px-2">
      <GlassCard className="p-6 w-full max-w-xs" glow={0.4}>
        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.p className="font-serif text-4xl text-red-400/60 line-through" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 3, repeat: Infinity }}>Патриарх</motion.p>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-2xl opacity-40">⟳</motion.div>
          <motion.p className="font-serif text-4xl text-amber-600" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>Синод</motion.p>
          <p className="font-mono text-xs text-slate-400">Церковь подчинена государству</p>
          <div className="flex justify-center gap-2 mt-2">
            {["⛪", "📜", "🏛️", "⚖️"].map((e, i) => (
              <motion.span key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="text-xl">{e}</motion.span>
            ))}
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}

function IndustryActivity({ industry }: { industry: { options: number[]; total: number } }) {
  const [voted, setVoted] = useState(false);

  const vote = async (i: number) => {
    if (voted) return;
    setVoted(true);
    await fetch("/api/industry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option: i }) });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2">
      <h2 className="font-serif text-xl text-slate-700">Какая реформа важнее?</h2>
      <div className="w-full max-w-sm space-y-3">
        {IND_LABELS.map((label, i) => {
          const count = industry.options[i] ?? 0;
          const pct = industry.total > 0 ? (count / industry.total) * 100 : 0;
          return (
            <motion.button key={i} onClick={() => vote(i)} disabled={voted}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${voted ? "border-slate-200 bg-black/[0.02]" : "border-slate-200 bg-black/[0.04] active:bg-black/[0.06]"}`}
              whileTap={!voted ? { scale: 0.97 } : {}}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
            >
              {voted && (
                <motion.div className="absolute inset-y-0 left-0 rounded-xl" style={{ background: `${IND_COLORS[i]}15` }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 60 }} />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: IND_COLORS[i] }} />
                  <span className="text-sm text-slate-600">{label}</span>
                </div>
                {voted && <span className="font-mono text-xs text-slate-400">{count} ({Math.round(pct)}%)</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function FinaleView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center gap-6 px-4">
      <MorphingSVG variant="crown" className="h-24 w-24" color="rgba(245,158,11,0.35)" />
      <motion.h2 className="font-serif text-2xl font-bold text-slate-800" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Итоги реформы управления
      </motion.h2>
      <motion.p className="text-amber-600/70 font-serif text-lg" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
        От приказов — к регулярному государству
      </motion.p>
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[{ v: "12", l: "коллегий", c: "text-blue-600" }, { v: "8", l: "губерний", c: "text-green-600" }, { v: "14", l: "рангов", c: "text-amber-600" }].map((item, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.15, type: "spring" }}>
            <GlassCard className="p-3 text-center">
              <p className={`font-serif text-2xl ${item.c}`}>{item.v}</p>
              <p className="font-mono text-[9px] text-slate-400">{item.l}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      <motion.div className="flex gap-2 mt-4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
        {["⭐", "🌟", "✨", "💫", "🏆"].map((e, i) => (
          <motion.span key={i} animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="text-xl">{e}</motion.span>
        ))}
      </motion.div>
    </div>
  );
}
