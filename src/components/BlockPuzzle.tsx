"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import GlassCard from "./GlassCard";

const GRID = 8;

/* ── Piece definitions (row,col offsets) ────────────────────────── */
const PIECE_DEFS: number[][][] = [
  [[0,0],[0,1]],                               // domino-h
  [[0,0],[1,0]],                               // domino-v
  [[0,0],[0,1],[0,2]],                         // tri-h
  [[0,0],[1,0],[2,0]],                         // tri-v
  [[0,0],[0,1],[1,0],[1,1]],                   // square
  [[0,0],[1,0],[1,1]],                         // L-small
  [[0,0],[0,1],[1,0]],                         // L-small-r
  [[0,0],[0,1],[1,1]],                         // S-small
  [[0,1],[1,0],[1,1]],                         // Z-small
  [[0,0],[0,1],[0,2],[1,1]],                   // T
  [[0,0],[0,1],[0,2],[0,3]],                   // I-h
  [[0,0],[1,0],[2,0],[3,0]],                   // I-v
  [[0,0],[0,1],[1,1],[1,2]],                   // S
  [[0,1],[0,2],[1,0],[1,1]],                   // Z
  [[0,0],[1,0],[1,1],[1,2]],                   // J
  [[0,0],[0,1],[0,2],[1,2]],                   // L
  [[0,0],[0,1],[0,2],[1,0]],                   // L-rev
  [[0,0],[0,1],[0,2],[1,0],[1,2]],             // U
];

const COLORS = [
  "#3b82f6","#ef4444","#22c55e","#a855f7","#f59e0b",
  "#ec4899","#06b6d4","#84cc16","#f97316","#6366f1",
];

/* ── Seeded RNG (LCG) ──────────────────────────────────────────── */
function makeRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return ((s >>> 0) / 0x100000000);
  };
}

function pickPiece(rng: () => number): number[][] {
  return PIECE_DEFS[Math.floor(rng() * PIECE_DEFS.length)];
}

function makeBatch(rng: () => number): (number[][] | null)[] {
  return [pickPiece(rng), pickPiece(rng), pickPiece(rng)];
}

/* ── Component ─────────────────────────────────────────────────── */

interface Props {
  endpoint: string;
  title: string;
  subtitle: string;
  themeColor: string;
  total: number;
  goal?: number;
}

export default function BlockPuzzle({ endpoint, title, subtitle, themeColor, total, goal = 3 }: Props) {
  const rngRef = useRef(makeRng(Math.floor(Math.random() * 0x7fffffff)));

  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: GRID }, () => Array(GRID).fill(0))
  );
  const [pieces, setPieces] = useState<(number[][] | null)[]>(() => makeBatch(rngRef.current));
  const [selected, setSelected] = useState<number | null>(null);
  const [cleared, setCleared] = useState(0);
  const [colorSeq, setColorSeq] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [flashRows, setFlashRows] = useState<Set<number>>(new Set());
  const [flashCols, setFlashCols] = useState<Set<number>>(new Set());
  const completedRef = useRef(false);

  /* check & clear filled lines */
  const clearLines = useCallback((g: number[][]): { grid: number[][]; count: number } => {
    const next = g.map(r => [...r]);
    let count = 0;
    const rows = new Set<number>();
    const cols = new Set<number>();

    for (let r = 0; r < GRID; r++) if (next[r].every(c => c > 0)) rows.add(r);
    for (let c = 0; c < GRID; c++) if (next.every(row => row[c] > 0)) cols.add(c);

    rows.forEach(r => { next[r] = Array(GRID).fill(0); count++; });
    cols.forEach(c => { for (let r = 0; r < GRID; r++) next[r][c] = 0; count++; });

    if (count > 0) {
      setFlashRows(rows);
      setFlashCols(cols);
      setTimeout(() => { setFlashRows(new Set()); setFlashCols(new Set()); }, 400);
    }

    return { grid: next, count };
  }, []);

  /* place piece on grid */
  const place = useCallback((row: number, col: number) => {
    if (selected === null || completed) return;
    const piece = pieces[selected];
    if (!piece) return;

    const ok = piece.every(([dr, dc]) => {
      const r = row + dr, c = col + dc;
      return r >= 0 && r < GRID && c >= 0 && c < GRID && grid[r][c] === 0;
    });
    if (!ok) return;

    const ci = ((colorSeq - 1) % COLORS.length) + 1;
    const next = grid.map(r => [...r]);
    piece.forEach(([dr, dc]) => { next[row + dr][col + dc] = ci; });

    const result = clearLines(next);
    const newCleared = cleared + result.count;

    setGrid(result.grid);
    setCleared(newCleared);
    setColorSeq(colorSeq + 1);

    const updated = [...pieces];
    updated[selected] = null;
    setSelected(null);

    if (updated.every(p => p === null)) {
      setPieces(makeBatch(rngRef.current));
    } else {
      setPieces(updated);
    }

    if (newCleared >= goal && !completedRef.current) {
      completedRef.current = true;
      setCompleted(true);
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      });
    }
  }, [selected, pieces, grid, colorSeq, cleared, goal, completed, clearLines, endpoint]);

  /* get new pieces if stuck */
  const skipPieces = useCallback(() => {
    setPieces(makeBatch(rngRef.current));
    setSelected(null);
  }, []);

  /* reset whole board */
  const resetBoard = useCallback(() => {
    setGrid(Array.from({ length: GRID }, () => Array(GRID).fill(0)));
    setPieces(makeBatch(rngRef.current));
    setSelected(null);
    setCleared(0);
    setColorSeq(1);
  }, []);

  /* ── Completed view ──────────────────────────────────────────── */
  if (completed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <GlassCard className="p-8 text-center" glow={0.6}>
            <motion.p className="text-5xl mb-4" animate={{ rotate: [0, 10, -10, 0], y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🏆</motion.p>
            <h2 className="font-serif text-xl text-white/90 mb-2">Головоломка решена!</h2>
            <p className="font-mono text-xs text-amber-300/80">Линий собрано: {cleared}</p>
            <p className="font-mono text-xs text-white/30 mt-2">Решили: {total} чел.</p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  /* ── Main view ───────────────────────────────────────────────── */
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-1">
      <h2 className="font-serif text-lg text-white/80">{title}</h2>
      <p className="font-mono text-[10px] text-white/30">{subtitle}</p>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/40">{cleared}/{goal}</span>
        <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: themeColor }}
            animate={{ width: `${Math.min(cleared / goal, 1) * 100}%` }} transition={{ type: "spring" }} />
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-lg border border-white/10 bg-black/20 p-1 backdrop-blur-sm"
        style={{ width: "min(88vw, 340px)" }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: "2px" }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const isFlash = flashRows.has(r) || flashCols.has(c);
            const colorIndex = cell > 0 ? (cell - 1) % COLORS.length : -1;
            const bg = isFlash ? "rgba(255,255,255,0.35)"
              : cell > 0 ? `${COLORS[colorIndex]}44` : "rgba(255,255,255,0.03)";
            const border = isFlash ? "rgba(255,255,255,0.6)"
              : cell > 0 ? `${COLORS[colorIndex]}88` : "rgba(255,255,255,0.06)";

            return (
              <motion.button key={`${r}-${c}`} onClick={() => place(r, c)}
                className="aspect-square rounded-[3px] border transition-colors duration-150"
                style={{ background: bg, borderColor: border,
                  boxShadow: isFlash ? "0 0 10px rgba(255,255,255,0.3)" : cell > 0 ? `inset 0 0 6px ${COLORS[colorIndex]}22` : "none" }}
                whileTap={{ scale: 0.88 }}
                animate={isFlash ? { opacity: [1, 0.5, 1] } : {}}
                transition={isFlash ? { duration: 0.3, repeat: 1 } : {}}
              />
            );
          }))}
        </div>
      </div>

      {/* Pieces tray */}
      <div className="flex items-end justify-center gap-3 min-h-[72px]">
        {pieces.map((piece, idx) => {
          if (!piece) return <div key={idx} className="w-14 h-14 rounded-lg border border-dashed border-white/5" />;
          const isSel = selected === idx;
          const maxR = Math.max(...piece.map(([r]) => r)) + 1;
          const maxC = Math.max(...piece.map(([, c]) => c)) + 1;
          const pc = COLORS[((colorSeq + idx - 1) % COLORS.length)];
          return (
            <motion.button key={idx} onClick={() => setSelected(isSel ? null : idx)}
              className={`rounded-lg border p-1.5 transition-all ${isSel ? "border-amber-400/60 bg-amber-400/10" : "border-white/10 bg-white/5"}`}
              whileTap={{ scale: 0.93 }} animate={isSel ? { y: -5, scale: 1.08 } : { y: 0, scale: 1 }}>
              <div className="grid gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${maxC}, 14px)`, gridTemplateRows: `repeat(${maxR}, 14px)` }}>
                {Array.from({ length: maxR * maxC }).map((_, i) => {
                  const r = Math.floor(i / maxC), c = i % maxC;
                  const on = piece.some(([pr, pcc]) => pr === r && pcc === c);
                  return <div key={i} className="rounded-[2px]" style={{
                    width: 14, height: 14,
                    background: on ? `${pc}77` : "transparent",
                    border: on ? `1px solid ${pc}bb` : "none",
                    boxShadow: on ? `inset 0 0 4px ${pc}33` : "none",
                  }} />;
                })}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button onClick={skipPieces} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-white/40 active:bg-white/10 transition-colors">
          Другие блоки
        </button>
        <button onClick={resetBoard} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-white/40 active:bg-white/10 transition-colors">
          Очистить поле
        </button>
      </div>
      <p className="font-mono text-[9px] text-white/15">Выберите блок → нажмите на поле • Соберите линию целиком</p>
    </div>
  );
}
