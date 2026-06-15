"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { AgeBand, ChildProfile, Family, StoryLang } from "@/lib/content/types";
import { hashPin, isValidPin, makeSalt, verifyPin } from "@/lib/security/pin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as cloud from "@/lib/data/cloud";

/** Mode is fixed by environment: cloud when Supabase keys exist, else local. */
export const CLOUD = isSupabaseConfigured();

type NewProfile = { name: string; ageBand: AgeBand; language: StoryLang; avatar: string };

// Dedupe init() across the many components that call useHydrated() on first load.
let initPromise: Promise<void> | null = null;

interface FamilyState {
  ready: boolean; // init() finished
  userEmail: string | null; // cloud: signed-in parent; local: always null
  family: Family | null;
  profiles: ChildProfile[];
  parentUnlocked: boolean;

  init: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ hasSession: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  createFamily: (name: string, pin: string) => Promise<void>;
  addProfile: (p: NewProfile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  unlockParent: (pin: string) => Promise<boolean>;
  lockParent: () => void;
}

export const useFamily = create<FamilyState>()(
  persist(
    (set, get) => ({
      ready: false,
      userEmail: null,
      family: null,
      profiles: [],
      parentUnlocked: false,

      init: async () => {
        if (!CLOUD) {
          set({ ready: true }); // local: persisted state already rehydrated
          return;
        }
        const user = await cloud.currentUser();
        if (!user) {
          set({ ready: true, userEmail: null, family: null, profiles: [] });
          return;
        }
        const [family, profiles] = await Promise.all([cloud.getFamily(), cloud.listProfiles()]);
        set({ ready: true, userEmail: user.email ?? null, family, profiles });
      },

      signUp: async (email, password) => {
        const res = await cloud.signUp(email, password);
        if (res.hasSession) {
          const user = await cloud.currentUser();
          set({ userEmail: user?.email ?? email });
        }
        return res;
      },

      signIn: async (email, password) => {
        await cloud.signIn(email, password);
        const [user, family, profiles] = await Promise.all([
          cloud.currentUser(),
          cloud.getFamily(),
          cloud.listProfiles(),
        ]);
        set({ userEmail: user?.email ?? email, family, profiles, parentUnlocked: true });
      },

      signOut: async () => {
        await cloud.signOut();
        set({ userEmail: null, family: null, profiles: [], parentUnlocked: false });
      },

      createFamily: async (name, pin) => {
        if (!isValidPin(pin)) throw new Error("PIN must be 4 digits");
        const pinSalt = makeSalt();
        const pinHash = await hashPin(pin, pinSalt);
        const family: Family = { name, pinHash, pinSalt };
        if (CLOUD) await cloud.createFamilyRow(family);
        set({ family, parentUnlocked: true });
      },

      addProfile: async (p) => {
        if (CLOUD) {
          const profile = await cloud.addProfileRow(p);
          set({ profiles: [...get().profiles, profile] });
        } else {
          const profile: ChildProfile = { id: crypto.randomUUID(), ...p };
          set({ profiles: [...get().profiles, profile] });
        }
      },

      removeProfile: async (id) => {
        if (CLOUD) await cloud.removeProfileRow(id);
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
      // Cloud mode is the source of truth in the DB — don't cache family data in
      // localStorage. Local mode persists family + profiles. parentUnlocked is
      // NEVER persisted (a child reopening must never land unlocked).
      partialize: (s) =>
        CLOUD ? {} : { family: s.family, profiles: s.profiles },
    },
  ),
);

/** True once zustand has rehydrated AND init() has run. */
export function useHydrated(): boolean {
  const ready = useFamily((s) => s.ready);
  const init = useFamily((s) => s.init);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!useFamily.getState().ready && !initPromise) initPromise = init();
  }, [init]);
  return mounted && ready;
}
