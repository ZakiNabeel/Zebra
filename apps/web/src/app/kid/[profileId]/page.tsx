"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoryArt } from "@/components/art/StoryArt";
import { t, fontFor } from "@/lib/i18n";
import { useFamily, useHydrated } from "@/lib/store/family";
import { loadKidStories } from "@/lib/content/library";
import type { Story } from "@/lib/content/types";

/** Kid home: the child's library, filtered to their age band & profile. */
export default function KidHome({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = use(params);
  const hydrated = useHydrated();
  const router = useRouter();
  const profiles = useFamily((s) => s.profiles);
  const profile = profiles.find((p) => p.id === profileId);

  const [stories, setStories] = useState<Story[] | null>(null);
  useEffect(() => {
    if (profile) loadKidStories(profile).then(setStories).catch(() => setStories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  if (!hydrated) return null;
  if (!profile) {
    router.replace("/kid");
    return null;
  }

  const lang = profile.language; // kid UI follows the child's language
  const f = fontFor(lang);

  return (
    <main className={`kid-surface flex flex-1 flex-col p-6 ${f}`} dir={lang === "ur" ? "rtl" : "ltr"}>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">
          {profile.avatar} {t(lang, "kidHello")}, {profile.name}!
        </h1>
        <Link href="/kid" className="rounded-2xl bg-white/80 px-4 py-2 font-bold text-ink/60 border border-ink/10">
          ← {t(lang, "kidExit")}
        </Link>
      </header>

      <h2 className="mb-4 text-2xl font-bold text-ink/80">📚 {t(lang, "kidPickStory")}</h2>

      {stories === null && <p className="text-ink/60">{t(lang, "loading")}</p>}
      {stories !== null && stories.length === 0 && (
        <p className="text-ink/60">{t(lang, "kidNoStories")}</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(stories ?? []).map((story) => (
          <Link
            key={story.id}
            href={`/kid/${profile.id}/story/${story.id}`}
            className="overflow-hidden rounded-[2rem] bg-white shadow-md border-4 border-transparent transition hover:border-sunshine active:scale-[0.98]"
          >
            <StoryArt art={{ scene: story.coverScene, night: story.coverScene === "sitara-stars", stars: 5 }} className="rounded-b-none" />
            <div className="p-4">
              <div className={`text-xl font-bold ${story.title.ur && lang === "ur" ? "urdu" : ""}`}>
                {story.title[lang]}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
