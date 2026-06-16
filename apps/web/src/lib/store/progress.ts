"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Per-child star totals. Stored in localStorage on purpose: rewards are a play
 * mechanic, not data we need server-side, so writing them locally keeps games at
 * ZERO backend cost per answer — the design that lets the activity layer scale
 * to any number of concurrent kids. (A future sprint can opt-in sync to the
 * cloud for cross-device progress without changing this interface.)
 */
interface ProgressState {
  stars: Record<string, number>; // profileId -> total stars
  addStars: (profileId: string, n: number) => void;
  starsFor: (profileId: string) => number;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      stars: {},
      addStars: (profileId, n) =>
        set({ stars: { ...get().stars, [profileId]: (get().stars[profileId] ?? 0) + n } }),
      starsFor: (profileId) => get().stars[profileId] ?? 0,
    }),
    { name: "zebra-progress" },
  ),
);
