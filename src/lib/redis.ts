import { Redis } from "@upstash/redis";

// -------------------------------------------------------------------
// Upstash Redis client
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env vars.
// When the env vars are absent we fall back to an in-memory stub so
// the app can still run locally during development.
// -------------------------------------------------------------------

let redis: Redis | null = null;

function getRedis(): Redis {
  if (redis) return redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    // Fallback: still create client — Upstash SDK will throw clearly
    // if env is truly missing. During local dev you can set dummy values.
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? "https://placeholder.upstash.io",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "placeholder",
    });
  }
  return redis;
}

// ── Key helpers ─────────────────────────────────────────────────────

const KEYS = {
  currentSlide: "session:current_slide",
  activeUsers: "session:active_users",
  shipTaps: "session:ship_taps",
  beardVoteYes: "session:beard_vote_yes",
  beardVoteNo: "session:beard_vote_no",
  sessionId: "session:id",
} as const;

// ── Public API ──────────────────────────────────────────────────────

export async function getCurrentSlide(): Promise<number> {
  try {
    const val = await getRedis().get<number>(KEYS.currentSlide);
    return val ?? 0;
  } catch {
    return 0;
  }
}

export async function setCurrentSlide(slide: number): Promise<void> {
  try {
    await getRedis().set(KEYS.currentSlide, slide);
  } catch {
    // Silently fail for local dev without Redis
  }
}

export async function incrementActiveUsers(): Promise<number> {
  try {
    return await getRedis().incr(KEYS.activeUsers);
  } catch {
    return 1;
  }
}

export async function getActiveUsers(): Promise<number> {
  try {
    const val = await getRedis().get<number>(KEYS.activeUsers);
    return val ?? 0;
  } catch {
    return 0;
  }
}

export async function incrementShipTaps(amount = 1): Promise<number> {
  try {
    return await getRedis().incrby(KEYS.shipTaps, amount);
  } catch {
    return 0;
  }
}

export async function getShipTaps(): Promise<number> {
  try {
    const val = await getRedis().get<number>(KEYS.shipTaps);
    return val ?? 0;
  } catch {
    return 0;
  }
}

export async function voteBeard(yes: boolean): Promise<{ yes: number; no: number }> {
  try {
    const r = getRedis();
    if (yes) {
      await r.incr(KEYS.beardVoteYes);
    } else {
      await r.incr(KEYS.beardVoteNo);
    }
    const [y, n] = await Promise.all([
      r.get<number>(KEYS.beardVoteYes),
      r.get<number>(KEYS.beardVoteNo),
    ]);
    return { yes: y ?? 0, no: n ?? 0 };
  } catch {
    return { yes: 0, no: 0 };
  }
}

export async function getBeardVotes(): Promise<{ yes: number; no: number }> {
  try {
    const r = getRedis();
    const [y, n] = await Promise.all([
      r.get<number>(KEYS.beardVoteYes),
      r.get<number>(KEYS.beardVoteNo),
    ]);
    return { yes: y ?? 0, no: n ?? 0 };
  } catch {
    return { yes: 0, no: 0 };
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
    // noop
  }
}
