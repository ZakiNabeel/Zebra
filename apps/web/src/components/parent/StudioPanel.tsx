"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StoryArt } from "@/components/art/StoryArt";
import { t, fontFor, type Lang, type UiKey } from "@/lib/i18n";
import { createStory, listPending, approve, reject } from "@/lib/data/studio";
import type { CharacterKey, StoryTheme } from "@/lib/ai/prompt";
import type { ChildProfile, Story } from "@/lib/content/types";

const THEMES: [StoryTheme, UiKey][] = [
  ["sharing", "themeSharing"],
  ["honesty", "themeHonesty"],
  ["counting", "themeCounting"],
  ["courage", "themeCourage"],
  ["kindness", "themeKindness"],
];
const CHARS: [CharacterKey, UiKey][] = [
  ["zee", "charZee"],
  ["mano", "charMano"],
  ["sitara", "charSitara"],
  ["dada", "charDada"],
];

/**
 * The adult-only creation studio: structured prompt → AI → moderation →
 * pending_review → YOUR approval → published_profile. Children never see this
 * surface, and nothing leaves the review queue without an explicit approval.
 */
export function StudioPanel({ profiles, lang }: { profiles: ChildProfile[]; lang: Lang }) {
  const f = fontFor(lang);
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [theme, setTheme] = useState<StoryTheme>("sharing");
  const [character, setCharacter] = useState<CharacterKey>("zee");
  const [length, setLength] = useState<"short" | "medium">("short");
  const [childName, setChildName] = useState("");

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "blocked" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState<Story[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  async function reload() {
    try {
      setPending(await listPending());
    } catch {
      /* keep last list */
    }
  }
  useEffect(() => {
    void reload();
  }, []);

  if (profiles.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">✨ {t(lang, "pdCreateSection")}</h2>
        <p className="rounded-3xl bg-white p-5 text-ink/70 border border-dashed border-ink/20">
          {t(lang, "csNeedChild")}
        </p>
      </section>
    );
  }

  const selected = profiles.find((p) => p.id === profileId) ?? profiles[0];

  async function onGenerate() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await createStory(
        {
          childName: childName.trim() || undefined,
          theme,
          character,
          ageBand: selected.ageBand,
          length,
        },
        selected.id,
      );
      if (!res.persisted) {
        setNotice({ kind: "blocked", text: t(lang, "rqBlocked") });
      } else {
        const gen = res.source === "gemini" ? t(lang, "csGenGemini") : t(lang, "csGenTemplate");
        setNotice({ kind: "ok", text: `${t(lang, "csMadeWith")} ${gen}. ${t(lang, "rqModPassed")}` });
        await reload();
      }
    } catch {
      setNotice({ kind: "error", text: t(lang, "authError") });
    } finally {
      setBusy(false);
    }
  }

  async function onApprove(s: Story) {
    setRowBusy(s.id);
    try {
      await approve(s.id, s.profileId ?? selected.id);
      await reload();
      setNotice({ kind: "ok", text: t(lang, "rqApproved") });
    } finally {
      setRowBusy(null);
    }
  }

  async function onReject(s: Story) {
    setRowBusy(s.id);
    try {
      await reject(s.id);
      await reload();
    } finally {
      setRowBusy(null);
    }
  }

  // Full literal class strings (Tailwind can't see interpolated fragments).
  const pill = (active: boolean, color: "mango" | "teal") => {
    const base = "rounded-2xl border-2 px-3 py-2 text-sm font-bold ";
    if (!active) return base + "border-ink/15";
    return base + (color === "mango" ? "border-mango bg-mango text-white" : "border-teal bg-teal text-white");
  };

  return (
    <>
      {/* Create */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">✨ {t(lang, "pdCreateSection")}</h2>
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 border border-ink/10">
          {/* Child */}
          <label className="text-sm font-bold text-ink/70">{t(lang, "csForChild")}</label>
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => (
              <button key={p.id} onClick={() => setProfileId(p.id)} className={pill(p.id === selected.id, "teal")}>
                {p.avatar} {p.name}
              </button>
            ))}
          </div>

          {/* Theme */}
          <label className="text-sm font-bold text-ink/70">{t(lang, "csTheme")}</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map(([key, label]) => (
              <button key={key} onClick={() => setTheme(key)} className={pill(theme === key, "mango")}>
                {t(lang, label)}
              </button>
            ))}
          </div>

          {/* Character */}
          <label className="text-sm font-bold text-ink/70">{t(lang, "csCharacter")}</label>
          <div className="flex flex-wrap gap-2">
            {CHARS.map(([key, label]) => (
              <button key={key} onClick={() => setCharacter(key)} className={pill(character === key, "teal")}>
                {t(lang, label)}
              </button>
            ))}
          </div>

          {/* Length */}
          <label className="text-sm font-bold text-ink/70">{t(lang, "csLength")}</label>
          <div className="flex gap-2">
            {(["short", "medium"] as const).map((l) => (
              <button key={l} onClick={() => setLength(l)} className={pill(length === l, "mango")}>
                {t(lang, l === "short" ? "csShort" : "csMedium")}
              </button>
            ))}
          </div>

          {/* Optional name */}
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder={t(lang, "csChildName")}
            maxLength={30}
            className="rounded-2xl border-2 border-ink/15 px-4 py-3 outline-none focus:border-teal"
          />

          <Button onClick={onGenerate} disabled={busy} className={f}>
            {busy ? `⏳ ${t(lang, "csGenerating")}` : `✨ ${t(lang, "csGenerate")}`}
          </Button>

          {notice && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                notice.kind === "ok"
                  ? "bg-leaf/15 text-leaf"
                  : notice.kind === "blocked"
                    ? "bg-rose/15 text-rose"
                    : "bg-berry/15 text-berry"
              }`}
            >
              {notice.text}
            </p>
          )}
          <p className="text-xs text-ink/50">🛡️ {t(lang, "rqSafetyNote")}</p>
        </div>
      </section>

      {/* Review queue */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">📝 {t(lang, "pdReviewSection")}</h2>
        {pending.length === 0 ? (
          <p className="rounded-3xl bg-white p-5 text-ink/60 border border-ink/10">{t(lang, "rqEmpty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((s) => {
              const child = profiles.find((p) => p.id === s.profileId);
              const open = previewId === s.id;
              return (
                <div key={s.id} className="rounded-3xl bg-white p-4 border border-ink/10">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-bold">{s.title[lang]}</div>
                      <div className="text-xs text-ink/50">
                        {t(lang, "rqWaiting")}
                        {child && ` · ${t(lang, "rqForChild")} ${child.name}`}
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewId(open ? null : s.id)}
                      className="text-sm font-bold text-teal underline"
                    >
                      {open ? t(lang, "rqHide") : t(lang, "rqPreview")}
                    </button>
                  </div>

                  {open && (
                    <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-cream p-3">
                      {s.pages.map((page, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-24 shrink-0">
                            <StoryArt art={page.art} />
                          </div>
                          <p className={`text-sm ${lang === "ur" ? "urdu" : ""}`}>{page.text[lang]}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button size="md" onClick={() => onApprove(s)} disabled={rowBusy === s.id} className={f}>
                      ✅ {t(lang, "rqApprove")}
                    </Button>
                    <Button
                      size="md"
                      variant="danger"
                      onClick={() => onReject(s)}
                      disabled={rowBusy === s.id}
                      className={f}
                    >
                      ✕ {t(lang, "rqReject")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
