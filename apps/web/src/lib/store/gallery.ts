"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A saved coloring = the page it's based on + a {regionId → color} fill map. */
export type Coloring = { id: string; pageId: string; fills: Record<string, string>; at: number };

/**
 * "My Gallery" — saved colorings per child, in localStorage. We persist only the
 * tiny fill map (not a rendered image), so storage stays minute and the feature
 * adds no backend cost at any number of users.
 */
interface GalleryState {
  items: Record<string, Coloring[]>; // profileId -> colorings (newest first)
  save: (profileId: string, c: Coloring) => void;
  remove: (profileId: string, id: string) => void;
  listFor: (profileId: string) => Coloring[];
}

export const useGallery = create<GalleryState>()(
  persist(
    (set, get) => ({
      items: {},
      save: (profileId, c) =>
        set({ items: { ...get().items, [profileId]: [c, ...(get().items[profileId] ?? [])].slice(0, 24) } }),
      remove: (profileId, id) =>
        set({
          items: { ...get().items, [profileId]: (get().items[profileId] ?? []).filter((x) => x.id !== id) },
        }),
      listFor: (profileId) => get().items[profileId] ?? [],
    }),
    { name: "zebra-gallery" },
  ),
);
