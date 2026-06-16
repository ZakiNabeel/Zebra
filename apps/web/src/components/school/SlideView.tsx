"use client";

import { StoryArt } from "@/components/art/StoryArt";
import type { Lang } from "@/lib/i18n";
import type { Slide } from "@/lib/school/types";

/** One rendered slide — shared by present mode and the print/PDF layout. */
export function SlideView({ slide, lang, className = "" }: { slide: Slide; lang: Lang; className?: string }) {
  const urdu = lang === "ur" ? "urdu" : "";
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 p-8 text-center ${className}`}
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-sm">
        <StoryArt art={{ scene: slide.scene }} />
      </div>
      <h2 className={`text-4xl font-extrabold ${urdu}`}>{slide.title[lang]}</h2>
      {slide.bullets.length > 0 && (
        <ul className="flex flex-col items-center gap-3">
          {slide.bullets.map((bp, i) => (
            <li key={i} className={`text-2xl text-ink/80 ${urdu}`}>
              • {bp[lang]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
