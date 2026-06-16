"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentStatus, Story } from "@/lib/content/types";

/**
 * LOCAL-MODE store for adult-created stories (the $0/offline path). In cloud
 * mode the stories table + RLS is the source of truth and this stays empty —
 * src/lib/data/studio.ts decides which path to use. Pending items live here too,
 * but the Kid loader filters them out (only published_* ever reaches a child).
 */
interface StudioState {
  stories: Story[];
  add: (s: Story) => void;
  setStatus: (id: string, status: ContentStatus, patch?: Partial<Story>) => void;
  remove: (id: string) => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      stories: [],
      add: (s) => set({ stories: [s, ...get().stories] }),
      setStatus: (id, status, patch) =>
        set({
          stories: get().stories.map((s) =>
            s.id === id ? { ...s, ...patch, status } : s,
          ),
        }),
      remove: (id) => set({ stories: get().stories.filter((s) => s.id !== id) }),
    }),
    { name: "zebra-studio" },
  ),
);
