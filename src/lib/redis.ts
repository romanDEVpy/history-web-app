import { Redis } from "@upstash/redis";

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
  redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  return redis;
}

// ── In-memory fallback ──────────────────────────────────────────────

const mem: Record<string, number> = {};

const memory = {
  get: (key: string): number => mem[key] ?? 0,
  set: (key: string, val: number) => { mem[key] = val; },
  incr: (key: string): number => { mem[key] = (mem[key] ?? 0) + 1; return mem[key]; },
  incrby: (key: string, n: number): number => { mem[key] = (mem[key] ?? 0) + n; return mem[key]; },
};

// ── Keys ────────────────────────────────────────────────────────────

const K = {
  slide: "s:slide",
  users: "s:users",
  shipTaps: "s:ship_taps",
  beardYes: "s:beard_yes",
  beardNo: "s:beard_no",
  senateSum: "s:senate_sum",
  senateCount: "s:senate_cnt",
  quizA: "s:quiz_a",
  quizB: "s:quiz_b",
  quizC: "s:quiz_c",
  quizD: "s:quiz_d",
  cityTaps: "s:city_taps",
  indA: "s:ind_a",
  indB: "s:ind_b",
  indC: "s:ind_c",
  indD: "s:ind_d",
} as const;

const ALL_KEYS = Object.values(K);

// ── Helpers ─────────────────────────────────────────────────────────

async function rGet(key: string): Promise<number> {
  if (!USE_REAL_REDIS) return memory.get(key);
  try { return (await getRedis().get<number>(key)) ?? 0; } catch { return memory.get(key); }
}

async function rSet(key: string, val: number): Promise<void> {
  if (!USE_REAL_REDIS) { memory.set(key, val); return; }
  try { await getRedis().set(key, val); } catch { memory.set(key, val); }
}

async function rIncr(key: string): Promise<number> {
  if (!USE_REAL_REDIS) return memory.incr(key);
  try { return await getRedis().incr(key); } catch { return memory.incr(key); }
}

async function rIncrBy(key: string, n: number): Promise<number> {
  if (!USE_REAL_REDIS) return memory.incrby(key, n);
  try { return await getRedis().incrby(key, n); } catch { return memory.incrby(key, n); }
}

// ── Public API ──────────────────────────────────────────────────────

export const getCurrentSlide = () => rGet(K.slide);
export const setCurrentSlide = (v: number) => rSet(K.slide, v);
export const incrementActiveUsers = () => rIncr(K.users);
export const getActiveUsers = () => rGet(K.users);
export const incrementShipTaps = (n = 1) => rIncrBy(K.shipTaps, n);
export const getShipTaps = () => rGet(K.shipTaps);
export const incrementCityTaps = (n = 1) => rIncrBy(K.cityTaps, n);
export const getCityTaps = () => rGet(K.cityTaps);

export async function voteBeard(yes: boolean) {
  if (yes) await rIncr(K.beardYes); else await rIncr(K.beardNo);
  return { yes: await rGet(K.beardYes), no: await rGet(K.beardNo) };
}
export async function getBeardVotes() {
  return { yes: await rGet(K.beardYes), no: await rGet(K.beardNo) };
}

export async function submitSenate(value: number) {
  await rIncrBy(K.senateSum, value);
  await rIncr(K.senateCount);
  const [sum, cnt] = await Promise.all([rGet(K.senateSum), rGet(K.senateCount)]);
  return { average: cnt > 0 ? Math.round(sum / cnt) : 50, count: cnt };
}
export async function getSenate() {
  const [sum, cnt] = await Promise.all([rGet(K.senateSum), rGet(K.senateCount)]);
  return { average: cnt > 0 ? Math.round(sum / cnt) : 50, count: cnt };
}

export async function submitQuiz(option: number) {
  const keys = [K.quizA, K.quizB, K.quizC, K.quizD];
  if (option >= 0 && option < 4) await rIncr(keys[option]);
  return getQuizResults();
}
export async function getQuizResults() {
  const [a, b, c, d] = await Promise.all([rGet(K.quizA), rGet(K.quizB), rGet(K.quizC), rGet(K.quizD)]);
  return { options: [a, b, c, d], total: a + b + c + d };
}

export async function submitIndustry(option: number) {
  const keys = [K.indA, K.indB, K.indC, K.indD];
  if (option >= 0 && option < 4) await rIncr(keys[option]);
  return getIndustryResults();
}
export async function getIndustryResults() {
  const [a, b, c, d] = await Promise.all([rGet(K.indA), rGet(K.indB), rGet(K.indC), rGet(K.indD)]);
  return { options: [a, b, c, d], total: a + b + c + d };
}

export async function getFullState() {
  const [currentSlide, activeUsers, shipTaps, beardVotes, senate, quiz, cityTaps, industry] =
    await Promise.all([
      getCurrentSlide(), getActiveUsers(), getShipTaps(), getBeardVotes(),
      getSenate(), getQuizResults(), getCityTaps(), getIndustryResults(),
    ]);
  return { currentSlide, activeUsers, shipTaps, beardVotes, senate, quiz, cityTaps, industry };
}

export async function resetSession(): Promise<void> {
  await Promise.all(ALL_KEYS.map((k) => rSet(k, 0)));
}
