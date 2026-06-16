"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StoryArt } from "@/components/art/StoryArt";
import { SpeakButton } from "@/components/reader/SpeakButton";
import { t, fontFor } from "@/lib/i18n";
import { useFamily, useHydrated } from "@/lib/store/family";
import { loadKidStories } from "@/lib/content/library";
import type { Story } from "@/lib/content/types";

/** The story reader: one page at a time, big art, big text. */
export default function StoryReader({
  params,
}: {
  params: Promise<{ profileId: string; storyId: string }>;
}) {
  const { profileId, storyId } = use(params);
  const hydrated = useHydrated();
  const router = useRouter();
  const profiles = useFamily((s) => s.profiles);
  const profile = profiles.find((p) => p.id === profileId);
  const [pageIndex, setPageIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  // Resolve through the SAME safety loader as the library — a story not visible
  // to this profile can't be opened by URL either. `loaded` distinguishes
  // "still loading" from "loaded, not allowed".
  const [story, setStory] = useState<Story | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!profile) return;
    loadKidStories(profile)
      .then((list) => {
        setStory(list.find((s) => s.id === storyId) ?? null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, storyId]);

  if (!hydrated) return null;
  if (!profile) {
    router.replace("/kid");
    return null;
  }
  if (!loaded) return null;
  if (!story) {
    router.replace(`/kid/${profile.id}`);
    return null;
  }

  const lang = profile.language;
  const f = fontFor(lang);
  const page = story.pages[pageIndex];
  const isLast = pageIndex === story.pages.length - 1;

  function next() {
    if (isLast) setFinished(true);
    else setPageIndex(pageIndex + 1);
  }

  function prev() {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  }

  if (finished) {
    return (
      <main className={`kid-surface flex flex-1 flex-col items-center justify-center gap-6 p-6 ${f}`}>
        <div className="text-7xl">🌟🌟🌟</div>
        <h1 className="text-4xl font-extrabold">{t(lang, "kidTheEnd")}</h1>
        <p className="text-xl text-ink/70">{t(lang, "kidGreatJob")}</p>
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => {
              setPageIndex(0);
              setFinished(false);
            }}
            className={f}
          >
            🔁 {t(lang, "kidReadAgain")}
          </Button>
          <Link href={`/kid/${profile.id}`}>
            <Button size="lg" variant="secondary" className={f}>
              📚 {t(lang, "kidAllStories")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`kid-surface mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between gap-4 p-6 ${f}`}
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      <header className="flex items-center justify-between">
        <Link
          href={`/kid/${profile.id}`}
          className="rounded-2xl bg-white/80 px-4 py-2 font-bold text-ink/60 border border-ink/10"
        >
          ← {t(lang, "kidExit")}
        </Link>
        <div className="flex gap-1.5" dir="ltr">
          {story.pages.map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full ${i === pageIndex ? "bg-mango" : "bg-ink/15"}`}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-col items-center gap-6">
        <StoryArt art={page.art} />
        <p
          className={`text-center text-2xl font-bold leading-relaxed ${lang === "ur" ? "urdu" : ""}`}
        >
          {page.text[lang]}
        </p>
        <SpeakButton
          key={pageIndex}
          text={page.text[lang]}
          lang={lang}
          audioUrl={page.audio?.[lang]}
          className={f}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button size="xl" variant="ghost" onClick={prev} disabled={pageIndex === 0} aria-label="previous page">
          {lang === "ur" ? "→" : "←"}
        </Button>
        <Button size="xl" onClick={next} aria-label="next page">
          {isLast ? "🌟" : lang === "ur" ? "←" : "→"}
        </Button>
      </div>
    </main>
  );
}
