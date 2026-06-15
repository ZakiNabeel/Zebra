"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useFamily, useHydrated, CLOUD } from "@/lib/store/family";
import { SEED_STORIES } from "@/lib/content/seed-stories";
import { libraryCount as cloudLibraryCount } from "@/lib/data/cloud";
import type { AgeBand, StoryLang } from "@/lib/content/types";

const AVATARS = ["🦓", "🐢", "🐆", "🐬", "🦜", "⭐", "🌙", "🚀"];

export default function ParentDashboard() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { lang, toggle } = useUiLang();
  const { family, profiles, parentUnlocked, userEmail, addProfile, removeProfile, lockParent, signOut } =
    useFamily();
  const f = fontFor(lang);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("3-5");
  const [storyLang, setStoryLang] = useState<StoryLang>("ur");
  const [avatar, setAvatar] = useState(AVATARS[1]);
  const [libCount, setLibCount] = useState(SEED_STORIES.length);

  // Guard: signed out (cloud) → /auth; no family → onboarding; locked → gate.
  useEffect(() => {
    if (!hydrated) return;
    if (CLOUD && !userEmail) router.replace("/auth");
    else if (!family) router.replace("/onboarding");
    else if (!parentUnlocked) router.replace("/");
  }, [hydrated, family, parentUnlocked, userEmail, router]);

  // Live library count from the cloud when available.
  useEffect(() => {
    if (CLOUD && parentUnlocked) cloudLibraryCount().then(setLibCount).catch(() => {});
  }, [parentUnlocked]);

  if (!hydrated || !family || !parentUnlocked) return null;

  async function saveChild() {
    await addProfile({ name: name.trim(), ageBand, language: storyLang, avatar });
    setName("");
    setAdding(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <main className={`mx-auto w-full max-w-3xl flex-1 p-6 ${f}`}>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">🔒 {t(lang, "pdTitle")}</h1>
          <p className="text-ink/60">{family.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="rounded-2xl bg-white px-3 py-2 font-bold border border-ink/10">
            {t(lang, "language")}
          </button>
          {CLOUD && (
            <Button variant="ghost" onClick={handleSignOut} className={f}>
              {t(lang, "signOut")}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              lockParent();
              router.push("/");
            }}
            className={f}
          >
            {t(lang, "pdLock")}
          </Button>
        </div>
      </header>

      {/* Children */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">👨‍👩‍👧 {t(lang, "pdChildren")}</h2>
        {profiles.length === 0 && <p className="text-ink/60">{t(lang, "pdNoChildren")}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 border border-ink/10">
              <span className="text-4xl">{p.avatar}</span>
              <div className="flex-1">
                <div className="text-lg font-bold">{p.name}</div>
                <div className="text-sm text-ink/60">
                  {p.ageBand} · {p.language === "ur" ? t(lang, "urdu") : t(lang, "english")}
                </div>
              </div>
              <button onClick={() => void removeProfile(p.id)} className="text-sm font-bold text-rose">
                {t(lang, "delete")}
              </button>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="mt-4 flex flex-col gap-3 rounded-3xl bg-white p-5 border border-ink/10">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(lang, "obChildName")}
              className="rounded-2xl border-2 border-ink/15 px-4 py-3 outline-none focus:border-teal"
            />
            <div className="flex gap-2">
              {(
                [
                  ["3-5", "band35"],
                  ["6-8", "band68"],
                  ["9-12", "band912"],
                ] as const
              ).map(([band, key]) => (
                <button
                  key={band}
                  onClick={() => setAgeBand(band)}
                  className={`flex-1 rounded-2xl border-2 px-2 py-2 text-sm font-bold ${
                    ageBand === band ? "border-mango bg-mango text-white" : "border-ink/15"
                  }`}
                >
                  {t(lang, key)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["ur", "urdu"],
                  ["en", "english"],
                ] as const
              ).map(([l, key]) => (
                <button
                  key={l}
                  onClick={() => setStoryLang(l)}
                  className={`flex-1 rounded-2xl border-2 px-2 py-2 text-sm font-bold ${
                    storyLang === l ? "border-teal bg-teal text-white" : "border-ink/15"
                  }`}
                >
                  {t(lang, key)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`rounded-xl p-1.5 text-2xl ${avatar === a ? "bg-sunshine" : "bg-cream"}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button disabled={name.trim().length === 0} onClick={saveChild} className={f}>
                {t(lang, "save")}
              </Button>
              <Button variant="ghost" onClick={() => setAdding(false)} className={f}>
                {t(lang, "cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setAdding(true)} className={`mt-4 ${f}`}>
            ＋ {t(lang, "pdAddChild")}
          </Button>
        )}
      </section>

      {/* Library */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">📚 {t(lang, "pdLibrary")}</h2>
        <div className="rounded-3xl bg-white p-5 border border-ink/10">
          <span className="text-3xl font-extrabold text-teal">{libCount}</span>{" "}
          <span className="text-ink/70">{t(lang, "pdLibraryCount")}</span>
        </div>
      </section>

      {/* Roadmap teaser — replaced by real features sprint by sprint */}
      <section>
        <h2 className="mb-3 text-xl font-bold">✨ {t(lang, "pdComingSoon")}</h2>
        <ul className="flex flex-col gap-2">
          {(["pdSoonCreate", "pdSoonAudio", "pdSoonGames"] as const).map((k) => (
            <li key={k} className="rounded-2xl bg-white/70 px-4 py-3 text-ink/70 border border-dashed border-ink/20">
              {t(lang, k)}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/kid" className="font-bold text-teal underline">
          → {t(lang, "kidMode")}
        </Link>
      </div>
    </main>
  );
}
