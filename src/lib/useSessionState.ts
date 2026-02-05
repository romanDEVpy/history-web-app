"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface SessionState {
  currentSlide: number;
  activeUsers: number;
  shipTaps: number;
  beardVotes: { yes: number; no: number };
}

const DEFAULT: SessionState = {
  currentSlide: 0,
  activeUsers: 0,
  shipTaps: 0,
  beardVotes: { yes: 0, no: 0 },
};

/**
 * Polls /api/state every `interval` ms and returns the latest session state.
 */
export function useSessionState(interval = 1000) {
  const [state, setState] = useState<SessionState>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok && mountedRef.current) {
        const data = await res.json();
        setState(data);
      }
    } catch {
      // network hiccup — keep last state
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    const id = setInterval(fetchState, interval);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchState, interval]);

  const setSlide = useCallback(async (slide: number) => {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_slide", slide }),
    });
    if (res.ok) {
      const data = await res.json();
      setState(data);
    }
  }, []);

  const reset = useCallback(async () => {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    if (res.ok) {
      const data = await res.json();
      setState(data);
    }
  }, []);

  return { state, loading, setSlide, reset, refetch: fetchState };
}
