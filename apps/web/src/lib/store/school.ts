"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClassRoom, Presentation } from "@/lib/school/types";

export { makeClassCode } from "@/lib/school/code";

/**
 * Teacher workspace state — presentations and classes. Kept in localStorage:
 * decks and class rosters are teacher tools, not child-facing content, so this
 * adds no backend cost and the school tools work fully offline. (Cloud sync for
 * cross-device decks can be layered on later without changing this interface.)
 */
interface SchoolState {
  presentations: Presentation[];
  classes: ClassRoom[];
  addPresentation: (p: Presentation) => void;
  updatePresentation: (id: string, patch: Partial<Presentation>) => void;
  removePresentation: (id: string) => void;
  getPresentation: (id: string) => Presentation | undefined;
  addClass: (c: ClassRoom) => void;
  removeClass: (id: string) => void;
}

export const useSchool = create<SchoolState>()(
  persist(
    (set, get) => ({
      presentations: [],
      classes: [],
      addPresentation: (p) => set({ presentations: [p, ...get().presentations] }),
      updatePresentation: (id, patch) =>
        set({ presentations: get().presentations.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      removePresentation: (id) => set({ presentations: get().presentations.filter((p) => p.id !== id) }),
      getPresentation: (id) => get().presentations.find((p) => p.id === id),
      addClass: (c) => set({ classes: [c, ...get().classes] }),
      removeClass: (id) => set({ classes: get().classes.filter((c) => c.id !== id) }),
    }),
    { name: "zebra-school" },
  ),
);
