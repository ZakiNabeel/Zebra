"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgeBand, ChildProfile, Family, StoryLang } from "@/lib/content/types";
import { hashPin, isValidPin, makeSalt, verifyPin } from "@/lib/security/pin";

/**
 * Local-mode data layer (localStorage). The Supabase adapter replaces this in
 * sprint 2+ behind the same actions; RLS then enforces what filter.ts
 * enforces here. Local mode stays as the offline/demo path.
 */
interface FamilyState {
  family: Family | null;
  profiles: ChildProfile[];
  /** Parent area unlocked for this tab session — never persisted. */
  parentUnlocked: boolean;

  createFamily: (name: string, pin: string) => Promise<void>;
  addProfile: (p: { name: string; ageBand: AgeBand; language: StoryLang; avatar: string }) => void;
  removeProfile: (id: string) => void;
  unlockParent: (pin: string) => Promise<boolean>;
  lockParent: () => void;
}

export const useFamily = create<FamilyState>()(
  persist(
    (set, get) => ({
      family: null,
      profiles: [],
      parentUnlocked: false,

      createFamily: async (name, pin) => {
        if (!isValidPin(pin)) throw new Error("PIN must be 4 digits");
        const pinSalt = makeSalt();
        const pinHash = await hashPin(pin, pinSalt);
        set({ family: { name, pinHash, pinSalt }, parentUnlocked: true });
      },

      addProfile: (p) => {
        const profile: ChildProfile = { id: crypto.randomUUID(), ...p };
        set({ profiles: [...get().profiles, profile] });
      },

      removeProfile: (id) => {
        set({ profiles: get().profiles.filter((x) => x.id !== id) });
      },

      unlockParent: async (pin) => {
        const family = get().family;
        if (!family) return false;
        const ok = await verifyPin(pin, family.pinSalt, family.pinHash);
        if (ok) set({ parentUnlocked: true });
        return ok;
      },

      lockParent: () => set({ parentUnlocked: false }),
    }),
    {
      name: "zebra-family",
      // parentUnlocked must die with the tab — a child reopening the app
      // must never land in an unlocked parent area.
      partialize: (s) => ({ family: s.family, profiles: s.profiles }),
    },
  ),
);

/** True once zustand has rehydrated from localStorage (avoids SSR mismatch). */
import { useEffect, useState } from "react";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
