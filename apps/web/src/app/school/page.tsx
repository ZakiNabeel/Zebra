"use client";

import Link from "next/link";
import { t, fontFor, useUiLang, type UiKey } from "@/lib/i18n";
import { useAdultArea } from "@/lib/auth/useAdultArea";

const TOOLS: { href: string; emoji: string; title: UiKey; sub: UiKey; color: string }[] = [
  { href: "/school/present", emoji: "🖥️", title: "schoolPresent", sub: "schoolPresentSub", color: "bg-teal/15" },
  { href: "/school/worksheet", emoji: "📝", title: "schoolWorksheet", sub: "schoolWorksheetSub", color: "bg-mango/15" },
  { href: "/school/classes", emoji: "🏫", title: "schoolClasses", sub: "schoolClassesSub", color: "bg-berry/15" },
];

export default function SchoolHub() {
  const ok = useAdultArea();
  const { lang, toggle } = useUiLang();
  const f = fontFor(lang);
  if (!ok) return null;

  return (
    <main className={`mx-auto w-full max-w-3xl flex-1 p-6 ${f}`}>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">🎓 {t(lang, "schoolTitle")}</h1>
          <p className="text-ink/60">{t(lang, "schoolSub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="rounded-2xl bg-white px-3 py-2 font-bold border border-ink/10">
            {t(lang, "language")}
          </button>
          <Link href="/parent" className="rounded-2xl bg-white px-4 py-2 font-bold text-ink/60 border border-ink/10">
            ← {t(lang, "pdTitle")}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`flex flex-col items-center justify-center gap-2 rounded-[1.75rem] ${tool.color} p-6 text-center border-4 border-transparent transition hover:border-sunshine active:scale-95`}
          >
            <span className="text-5xl">{tool.emoji}</span>
            <span className="text-lg font-bold">{t(lang, tool.title)}</span>
            <span className="text-sm text-ink/60">{t(lang, tool.sub)}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
