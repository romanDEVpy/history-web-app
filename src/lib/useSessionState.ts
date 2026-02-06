"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface SessionState {
  currentSlide: number;
  activeUsers: number;
  shipTaps: number;
  beardVotes: { yes: number; no: number };
  senate: { average: number; count: number };
  quiz: { options: number[]; total: number };
  cityTaps: number;
  industry: { options: number[]; total: number };
}

const DEFAULT: SessionState = {
  currentSlide: 0,
  activeUsers: 0,
  shipTaps: 0,
  beardVotes: { yes: 0, no: 0 },
  senate: { average: 50, count: 0 },
  quiz: { options: [0, 0, 0, 0], total: 0 },
  cityTaps: 0,
  industry: { options: [0, 0, 0, 0], total: 0 },
};

export function useSessionState(interval = 1000) {
  const [state, setState] = useState<SessionState>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok && mountedRef.current) setState(await res.json());
    } catch { /* keep last */ } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    const id = setInterval(fetchState, interval);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchState, interval]);

  const setSlide = useCallback(async (slide: number) => {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_slide", slide }),
    });
    if (res.ok) setState(await res.json());
  }, []);

  const reset = useCallback(async () => {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    if (res.ok) setState(await res.json());
  }, []);

  return { state, loading, setSlide, reset, refetch: fetchState };
}
