"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, fontFor } from "@/lib/i18n";
import { useFamily, useHydrated } from "@/lib/store/family";
import { COLORING_PAGES, pageById } from "@/lib/art/coloring-pages";
import { PageSvg, ColoringCanvas } from "@/components/coloring/ColoringCanvas";
import { useGallery } from "@/lib/store/gallery";

export default function ColorPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = use(params);
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useFamily((s) => s.profiles).find((p) => p.id === profileId);
  const items = useGallery((s) => s.items)[profileId] ?? [];
  const removeItem = useGallery((s) => s.remove);
  const [pageId, setPageId] = useState<string | null>(null);

  if (!hydrated) return null;
  if (!profile) {
    router.replace("/kid");
    return null;
  }

  const lang = profile.language;
  const f = fontFor(lang);
  const page = pageId ? pageById(pageId) : null;

  return (
    <main className={`kid-surface mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6 ${f}`} dir={lang === "ur" ? "rtl" : "ltr"}>
      <header className="flex items-center justify-between">
        <button
          onClick={() => (page ? setPageId(null) : router.push(`/kid/${profile.id}`))}
          className="rounded-2xl bg-white/80 px-4 py-2 font-bold text-ink/60 border border-ink/10"
        >
          ← {t(lang, "kidExit")}
        </button>
        <h1 className="text-2xl font-extrabold">🎨 {t(lang, "kidColor")}</h1>
      </header>

      {page ? (
        <ColoringCanvas page={page} profileId={profile.id} lang={lang} />
      ) : (
        <>
          {/* Page picker */}
          <h2 className="text-xl font-bold text-ink/80">{t(lang, "colPick")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {COLORING_PAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPageId(p.id)}
                className="overflow-hidden rounded-[1.5rem] bg-white border-4 border-transparent transition hover:border-sunshine active:scale-95"
              >
                <PageSvg page={p} fills={{}} className="h-auto w-full" />
                <div className="p-2 text-center text-sm font-bold">{p.name[lang]}</div>
              </button>
            ))}
          </div>

          {/* Gallery */}
          <h2 className="mt-2 text-xl font-bold text-ink/80">⭐ {t(lang, "colGallery")}</h2>
          {items.length === 0 ? (
            <p className="text-ink/60">{t(lang, "colEmpty")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((item) => {
                const src = pageById(item.pageId);
                if (!src) return null;
                return (
                  <div key={item.id} className="relative overflow-hidden rounded-[1.5rem] bg-white border border-ink/10">
                    <PageSvg page={src} fills={item.fills} className="h-auto w-full" />
                    <button
                      onClick={() => removeItem(profile.id, item.id)}
                      aria-label="remove"
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose font-bold text-white"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="mt-2">
        <Link href={`/kid/${profile.id}`} className="font-bold text-teal underline">
          ← {t(lang, "kidStories")}
        </Link>
      </div>
    </main>
  );
}
