"use client";

import { motion, type PanInfo } from "framer-motion";
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
  const gridRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const rafRef = useRef(0);
  const isDraggingRef = useRef(false);

  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: GRID }, () => Array(GRID).fill(0))
  );
  const [pieces, setPieces] = useState<(number[][] | null)[]>(() => makeBatch(rngRef.current));
  const [selected, setSelected] = useState<number | null>(null);
  const [cleared, setCleared] = useState(0);
  const [colorSeq, setColorSeq] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());
  const [previewCells, setPreviewCells] = useState<Set<string>>(new Set());
  const [previewValid, setPreviewValid] = useState(false);

  /* ── Helpers ──────────────────────────────────────────────── */

  const canPlaceAt = useCallback((piece: number[][], row: number, col: number, g: number[][] = grid) => {
    return piece.every(([dr, dc]) => {
      const r = row + dr, c = col + dc;
      return r >= 0 && r < GRID && c >= 0 && c < GRID && g[r][c] === 0;
    });
  }, [grid]);

  const getGridCell = useCallback((px: number, py: number): { row: number; col: number } | null => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    // border (1px) + padding p-1 (4px) = 5px inset
    const pad = 5;
    const stepX = (rect.width - pad * 2 + 2) / GRID;
    const stepY = (rect.height - pad * 2 + 2) / GRID;
    const col = Math.floor((px - rect.left - pad) / stepX);
    const row = Math.floor((py - rect.top - pad) / stepY);
    if (row < 0 || col < 0 || row >= GRID || col >= GRID) return null;
    return { row, col };
  }, []);

  const clearLines = useCallback((g: number[][]): { grid: number[][]; count: number } => {
    const next = g.map(r => [...r]);
    let count = 0;
    const flash = new Set<string>();

    for (let r = 0; r < GRID; r++) {
      if (next[r].every(c => c > 0)) {
        for (let c = 0; c < GRID; c++) flash.add(`${r}-${c}`);
        next[r] = Array(GRID).fill(0);
        count++;
      }
    }
    for (let c = 0; c < GRID; c++) {
      if (next.every(row => row[c] > 0)) {
        for (let r = 0; r < GRID; r++) flash.add(`${r}-${c}`);
        for (let r = 0; r < GRID; r++) next[r][c] = 0;
        count++;
      }
    }

    if (flash.size > 0) {
      setFlashCells(flash);
      setTimeout(() => setFlashCells(new Set()), 400);
    }
    return { grid: next, count };
  }, []);

  /* place piece on grid at given position */
  const doPlace = useCallback((row: number, col: number, pieceIdx: number) => {
    if (completed) return false;
    const piece = pieces[pieceIdx];
    if (!piece || !canPlaceAt(piece, row, col)) return false;

    const ci = ((colorSeq - 1) % COLORS.length) + 1;
    const next = grid.map(r => [...r]);
    piece.forEach(([dr, dc]) => { next[row + dr][col + dc] = ci; });

    const result = clearLines(next);
    const newCleared = cleared + result.count;

    setGrid(result.grid);
    setCleared(newCleared);
    setColorSeq(colorSeq + 1);

    const updated = [...pieces];
    updated[pieceIdx] = null;

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
    return true;
  }, [pieces, grid, colorSeq, cleared, goal, completed, canPlaceAt, clearLines, endpoint]);

  /* ── Drag handlers ─────────────────────────────────────────── */

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDrag = useCallback((pieceIdx: number, _: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const piece = pieces[pieceIdx];
      if (!piece) return;
      const rawPos = getGridCell(info.point.x, info.point.y);

      if (!rawPos) {
        setPreviewCells(new Set());
        setPreviewValid(false);
        return;
      }

      // Center piece on pointer position
      const maxR = Math.max(...piece.map(([r]) => r));
      const maxC = Math.max(...piece.map(([, c]) => c));
      const row = rawPos.row - Math.floor(maxR / 2);
      const col = rawPos.col - Math.floor(maxC / 2);

      const valid = canPlaceAt(piece, row, col);
      const cells = new Set<string>();
      piece.forEach(([dr, dc]) => {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < GRID && c >= 0 && c < GRID) cells.add(`${r}-${c}`);
      });
      setPreviewCells(cells);
      setPreviewValid(valid);
    });
  }, [pieces, getGridCell, canPlaceAt]);

  const handleDragEnd = useCallback((pieceIdx: number, _: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    cancelAnimationFrame(rafRef.current);
    setTimeout(() => { isDraggingRef.current = false; }, 50);
    setPreviewCells(new Set());
    setPreviewValid(false);

    const piece = pieces[pieceIdx];
    if (!piece) return;
    const rawPos = getGridCell(info.point.x, info.point.y);
    if (!rawPos) return;

    // Center piece on pointer position
    const maxR = Math.max(...piece.map(([r]) => r));
    const maxC = Math.max(...piece.map(([, c]) => c));
    const row = rawPos.row - Math.floor(maxR / 2);
    const col = rawPos.col - Math.floor(maxC / 2);

    if (canPlaceAt(piece, row, col)) {
      doPlace(row, col, pieceIdx);
    }
  }, [pieces, getGridCell, canPlaceAt, doPlace]);

  /* ── Tap fallback handlers ─────────────────────────────────── */

  const handlePieceTap = useCallback((idx: number) => {
    if (isDraggingRef.current) return;
    setSelected(prev => prev === idx ? null : idx);
  }, []);

  const handleGridTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (selected === null || isDraggingRef.current) return;
    const pos = getGridCell(e.clientX, e.clientY);
    if (pos && doPlace(pos.row, pos.col, selected)) {
      setSelected(null);
    }
  }, [selected, getGridCell, doPlace]);

  /* ── Skip / Reset ──────────────────────────────────────────── */

  const skipPieces = useCallback(() => {
    setPieces(makeBatch(rngRef.current));
    setSelected(null);
    setPreviewCells(new Set());
  }, []);

  const resetBoard = useCallback(() => {
    setGrid(Array.from({ length: GRID }, () => Array(GRID).fill(0)));
    setPieces(makeBatch(rngRef.current));
    setSelected(null);
    setCleared(0);
    setColorSeq(1);
    setPreviewCells(new Set());
  }, []);

  /* ── Render: completed ─────────────────────────────────────── */
  if (completed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <GlassCard className="p-8 text-center" glow={0.6}>
            <motion.p className="text-5xl mb-4" animate={{ rotate: [0, 10, -10, 0], y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🏆</motion.p>
            <h2 className="font-serif text-xl text-slate-800 mb-2">Головоломка решена!</h2>
            <p className="font-mono text-xs text-amber-600">Линий собрано: {cleared}</p>
            <p className="font-mono text-xs text-slate-400 mt-2">Решили: {total} чел.</p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  /* ── Render: main ──────────────────────────────────────────── */
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-1">
      <h2 className="font-serif text-lg text-slate-700">{title}</h2>
      <p className="font-mono text-[10px] text-slate-400">{subtitle}</p>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-slate-500">{cleared}/{goal}</span>
        <div className="h-1.5 w-20 rounded-full bg-black/[0.06] overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: themeColor }}
            animate={{ width: `${Math.min(cleared / goal, 1) * 100}%` }} transition={{ type: "spring" }} />
        </div>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        onClick={handleGridTap}
        className="rounded-lg border border-slate-200/80 bg-white/50 p-1 backdrop-blur-sm"
        style={{ width: "min(88vw, 340px)" }}
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: "2px" }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isFlash = flashCells.has(key);
            const isPreview = previewCells.has(key);
            const ci = cell > 0 ? (cell - 1) % COLORS.length : -1;

            let bg: string, bc: string, shadow = "none";

            if (isFlash) {
              bg = "rgba(245,158,11,0.3)";
              bc = "rgba(245,158,11,0.6)";
              shadow = "0 0 12px rgba(245,158,11,0.3)";
            } else if (isPreview && cell === 0) {
              bg = previewValid ? `${themeColor}33` : "rgba(239,68,68,0.15)";
              bc = previewValid ? `${themeColor}88` : "rgba(239,68,68,0.4)";
              shadow = previewValid ? `0 0 8px ${themeColor}33` : "none";
            } else if (cell > 0) {
              bg = `${COLORS[ci]}44`;
              bc = `${COLORS[ci]}88`;
              shadow = `inset 0 0 6px ${COLORS[ci]}22`;
            } else {
              bg = "rgba(0,0,0,0.02)";
              bc = "rgba(0,0,0,0.06)";
            }

            return (
              <div
                key={key}
                className={`aspect-square rounded-[3px] border ${isFlash ? "puzzle-flash" : ""}`}
                style={{
                  background: bg,
                  borderColor: bc,
                  boxShadow: shadow,
                  transition: "background 150ms, border-color 150ms, box-shadow 150ms",
                }}
              />
            );
          }))}
        </div>
      </div>

      {/* Pieces tray */}
      <div className="flex items-end justify-center gap-3 min-h-[80px] relative" style={{ zIndex: 10 }}>
        {pieces.map((piece, idx) => {
          if (!piece) return (
            <div key={idx} className="w-16 h-16 rounded-lg border border-dashed border-slate-200 opacity-30" />
          );
          const isSel = selected === idx;
          const maxR = Math.max(...piece.map(([r]) => r)) + 1;
          const maxC = Math.max(...piece.map(([, c]) => c)) + 1;
          const pc = COLORS[((colorSeq + idx - 1) % COLORS.length)];

          return (
            <motion.div
              key={`p-${idx}-${colorSeq}`}
              drag
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={0}
              onDragStart={handleDragStart}
              onDrag={(e, info) => handleDrag(idx, e, info)}
              onDragEnd={(e, info) => handleDragEnd(idx, e, info)}
              onClick={() => handlePieceTap(idx)}
              whileDrag={{
                scale: 1.2,
                zIndex: 100,
                boxShadow: "0 16px 40px rgba(0,0,0,0.15), 0 0 20px rgba(245,158,11,0.1)",
              }}
              animate={isSel ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
              className={`rounded-lg border p-2 cursor-grab active:cursor-grabbing touch-none select-none ${
                isSel ? "border-amber-500/60 bg-amber-500/10" : "border-slate-200 bg-black/[0.03]"
              }`}
              style={{ zIndex: isSel ? 5 : 1 }}
            >
              <div
                className="grid gap-[2px] pointer-events-none"
                style={{ gridTemplateColumns: `repeat(${maxC}, 16px)`, gridTemplateRows: `repeat(${maxR}, 16px)` }}
              >
                {Array.from({ length: maxR * maxC }).map((_, i) => {
                  const r = Math.floor(i / maxC), c = i % maxC;
                  const on = piece.some(([pr, pcc]) => pr === r && pcc === c);
                  return (
                    <div key={i} className="rounded-[2px]" style={{
                      width: 16, height: 16,
                      background: on ? `${pc}77` : "transparent",
                      border: on ? `1px solid ${pc}bb` : "none",
                      boxShadow: on ? `inset 0 0 4px ${pc}33` : "none",
                    }} />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button onClick={skipPieces} className="rounded-full border border-slate-200 bg-black/[0.03] px-3 py-1 font-mono text-[10px] text-slate-500 active:bg-black/[0.06] transition-colors">
          Другие блоки
        </button>
        <button onClick={resetBoard} className="rounded-full border border-slate-200 bg-black/[0.03] px-3 py-1 font-mono text-[10px] text-slate-500 active:bg-black/[0.06] transition-colors">
          Очистить поле
        </button>
      </div>
      <p className="font-mono text-[9px] text-slate-300">Перетащите блок на поле • Соберите линию целиком</p>
    </div>
  );
}
