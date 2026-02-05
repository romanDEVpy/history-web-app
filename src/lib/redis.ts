import { Redis } from "@upstash/redis";

// -------------------------------------------------------------------
// Upstash Redis client with in-memory fallback.
// Supports both naming conventions:
//   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (Upstash direct)
//   - KV_REST_API_URL / KV_REST_API_TOKEN                (Vercel KV)
// Without valid credentials the app uses an in-memory store.
// -------------------------------------------------------------------

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";

const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

const USE_REAL_REDIS =
  !!REDIS_URL &&
  !!REDIS_TOKEN &&
  !REDIS_URL.includes("placeholder");

let redis: Redis | null = null;

function getRedis(): Redis {
  if (redis) return redis;
  redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });
  return redis;
}

// ── In-memory fallback store (single-process, resets on redeploy) ───

const mem: Record<string, number> = {
  current_slide: 0,
  active_users: 0,
  ship_taps: 0,
  beard_vote_yes: 0,
  beard_vote_no: 0,
};

const memory = {
  get: (key: string): number => mem[key] ?? 0,
  set: (key: string, val: number) => { mem[key] = val; },
  incr: (key: string): number => { mem[key] = (mem[key] ?? 0) + 1; return mem[key]; },
  incrby: (key: string, n: number): number => { mem[key] = (mem[key] ?? 0) + n; return mem[key]; },
};

// ── Key helpers ─────────────────────────────────────────────────────

const KEYS = {
  currentSlide: "current_slide",
  activeUsers: "active_users",
  shipTaps: "ship_taps",
  beardVoteYes: "beard_vote_yes",
  beardVoteNo: "beard_vote_no",
} as const;

// ── Public API ──────────────────────────────────────────────────────

export async function getCurrentSlide(): Promise<number> {
  if (!USE_REAL_REDIS) return memory.get(KEYS.currentSlide);
  try {
    const val = await getRedis().get<number>(KEYS.currentSlide);
    return val ?? 0;
  } catch {
    return memory.get(KEYS.currentSlide);
  }
}

export async function setCurrentSlide(slide: number): Promise<void> {
  if (!USE_REAL_REDIS) { memory.set(KEYS.currentSlide, slide); return; }
  try {
    await getRedis().set(KEYS.currentSlide, slide);
  } catch {
    memory.set(KEYS.currentSlide, slide);
  }
}

export async function incrementActiveUsers(): Promise<number> {
  if (!USE_REAL_REDIS) return memory.incr(KEYS.activeUsers);
  try {
    return await getRedis().incr(KEYS.activeUsers);
  } catch {
    return memory.incr(KEYS.activeUsers);
  }
}

export async function getActiveUsers(): Promise<number> {
  if (!USE_REAL_REDIS) return memory.get(KEYS.activeUsers);
  try {
    const val = await getRedis().get<number>(KEYS.activeUsers);
    return val ?? 0;
  } catch {
    return memory.get(KEYS.activeUsers);
  }
}

export async function incrementShipTaps(amount = 1): Promise<number> {
  if (!USE_REAL_REDIS) return memory.incrby(KEYS.shipTaps, amount);
  try {
    return await getRedis().incrby(KEYS.shipTaps, amount);
  } catch {
    return memory.incrby(KEYS.shipTaps, amount);
  }
}

export async function getShipTaps(): Promise<number> {
  if (!USE_REAL_REDIS) return memory.get(KEYS.shipTaps);
  try {
    const val = await getRedis().get<number>(KEYS.shipTaps);
    return val ?? 0;
  } catch {
    return memory.get(KEYS.shipTaps);
  }
}

export async function voteBeard(yes: boolean): Promise<{ yes: number; no: number }> {
  if (!USE_REAL_REDIS) {
    if (yes) memory.incr(KEYS.beardVoteYes); else memory.incr(KEYS.beardVoteNo);
    return { yes: memory.get(KEYS.beardVoteYes), no: memory.get(KEYS.beardVoteNo) };
  }
  try {
    const r = getRedis();
    if (yes) await r.incr(KEYS.beardVoteYes); else await r.incr(KEYS.beardVoteNo);
    const [y, n] = await Promise.all([
      r.get<number>(KEYS.beardVoteYes),
      r.get<number>(KEYS.beardVoteNo),
    ]);
    return { yes: y ?? 0, no: n ?? 0 };
  } catch {
    if (yes) memory.incr(KEYS.beardVoteYes); else memory.incr(KEYS.beardVoteNo);
    return { yes: memory.get(KEYS.beardVoteYes), no: memory.get(KEYS.beardVoteNo) };
  }
}

export async function getBeardVotes(): Promise<{ yes: number; no: number }> {
  if (!USE_REAL_REDIS) {
    return { yes: memory.get(KEYS.beardVoteYes), no: memory.get(KEYS.beardVoteNo) };
  }
  try {
    const r = getRedis();
    const [y, n] = await Promise.all([
      r.get<number>(KEYS.beardVoteYes),
      r.get<number>(KEYS.beardVoteNo),
    ]);
    return { yes: y ?? 0, no: n ?? 0 };
  } catch {
    return { yes: memory.get(KEYS.beardVoteYes), no: memory.get(KEYS.beardVoteNo) };
  }
}

export async function getFullState() {
  const [currentSlide, activeUsers, shipTaps, beardVotes] = await Promise.all([
    getCurrentSlide(),
    getActiveUsers(),
    getShipTaps(),
    getBeardVotes(),
  ]);
  return { currentSlide, activeUsers, shipTaps, beardVotes };
}

export async function resetSession(): Promise<void> {
  if (!USE_REAL_REDIS) {
    memory.set(KEYS.currentSlide, 0);
    memory.set(KEYS.activeUsers, 0);
    memory.set(KEYS.shipTaps, 0);
    memory.set(KEYS.beardVoteYes, 0);
    memory.set(KEYS.beardVoteNo, 0);
    return;
  }
  try {
    const r = getRedis();
    await Promise.all([
      r.set(KEYS.currentSlide, 0),
      r.set(KEYS.activeUsers, 0),
      r.set(KEYS.shipTaps, 0),
      r.set(KEYS.beardVoteYes, 0),
      r.set(KEYS.beardVoteNo, 0),
    ]);
  } catch {
    memory.set(KEYS.currentSlide, 0);
    memory.set(KEYS.activeUsers, 0);
    memory.set(KEYS.shipTaps, 0);
    memory.set(KEYS.beardVoteYes, 0);
    memory.set(KEYS.beardVoteNo, 0);
  }
}
