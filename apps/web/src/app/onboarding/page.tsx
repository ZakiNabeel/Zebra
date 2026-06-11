"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PinPad } from "@/components/ui/PinPad";
import { t, fontFor, useUiLang, type Lang } from "@/lib/i18n";
import { useFamily } from "@/lib/store/family";
import type { AgeBand, StoryLang } from "@/lib/content/types";

const AVATARS = ["🦓", "🐢", "🐆", "🐬", "🦜", "⭐", "🌙", "🚀"];

type Step = "family" | "pin" | "confirmPin" | "child";

export default function OnboardingPage() {
  const router = useRouter();
  const { lang, setLang } = useUiLang();
  const createFamily = useFamily((s) => s.createFamily);
  const addProfile = useFamily((s) => s.addProfile);
  const f = fontFor(lang);

  const [step, setStep] = useState<Step>("family");
  const [familyName, setFamilyName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [childName, setChildName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("3-5");
  const [storyLang, setStoryLang] = useState<StoryLang>("ur");
  const [avatar, setAvatar] = useState(AVATARS[0]);

  async function finish() {
    await createFamily(familyName.trim(), pin);
    addProfile({ name: childName.trim(), ageBand, language: storyLang, avatar });
    router.push("/parent");
  }

  return (
    <main className={`flex flex-1 flex-col items-center justify-center gap-8 p-6 ${f}`}>
      <h1 className="text-3xl font-extrabold">🦓 {t(lang, "obWelcome")}</h1>

      {step === "family" && (
        <div className="flex w-full max-w-sm flex-col gap-5">
          <label className="text-lg font-bold">{t(lang, "obFamilyName")}</label>
          <input
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder={t(lang, "obFamilyPlaceholder")}
            className="rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg outline-none focus:border-teal"
          />
          <label className="text-lg font-bold">{t(lang, "obPickLanguage")}</label>
          <div className="flex gap-3">
            {(["en", "ur"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 rounded-2xl border-2 px-4 py-3 font-bold ${
                  lang === l ? "border-teal bg-teal text-white" : "border-ink/15 bg-white"
                } ${l === "ur" ? "urdu" : ""}`}
              >
                {l === "en" ? "English" : "اردو"}
              </button>
            ))}
          </div>
          <Button
            size="lg"
            disabled={familyName.trim().length === 0}
            onClick={() => setStep("pin")}
            className={f}
          >
            {t(lang, "next")} →
          </Button>
        </div>
      )}

      {step === "pin" && (
        <div className="flex flex-col items-center gap-5">
          <p className="text-lg font-bold">{t(lang, "obSetPin")}</p>
          <p className="max-w-xs text-center text-ink/60">{t(lang, "obPinHint")}</p>
          <PinPad
            onComplete={(p) => {
              setPin(p);
              setStep("confirmPin");
            }}
          />
        </div>
      )}

      {step === "confirmPin" && (
        <div className="flex flex-col items-center gap-5">
          <p className="text-lg font-bold">{t(lang, "obConfirmPin")}</p>
          {pinError && <p className="font-bold text-rose">{t(lang, "obPinMismatch")}</p>}
          <PinPad
            shaking={pinError}
            onComplete={(p) => {
              if (p === pin) {
                setPinError(false);
                setStep("child");
              } else {
                setPinError(true);
                setStep("pin");
                setPin("");
              }
            }}
          />
        </div>
      )}

      {step === "child" && (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <p className="text-lg font-bold">{t(lang, "obFirstChild")}</p>
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder={t(lang, "obChildName")}
            className="rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg outline-none focus:border-teal"
          />
          <label className="font-bold">{t(lang, "obAgeBand")}</label>
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
                className={`flex-1 rounded-2xl border-2 px-2 py-3 font-bold ${
                  ageBand === band ? "border-mango bg-mango text-white" : "border-ink/15 bg-white"
                }`}
              >
                {t(lang, key)}
              </button>
            ))}
          </div>
          <label className="font-bold">{t(lang, "obStoryLanguage")}</label>
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
                className={`flex-1 rounded-2xl border-2 px-4 py-3 font-bold ${
                  storyLang === l ? "border-teal bg-teal text-white" : "border-ink/15 bg-white"
                }`}
              >
                {t(lang, key)}
              </button>
            ))}
          </div>
          <label className="font-bold">Avatar</label>
          <div className="grid grid-cols-8 gap-1">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`rounded-xl p-1.5 text-2xl ${avatar === a ? "bg-sunshine" : "bg-white"}`}
              >
                {a}
              </button>
            ))}
          </div>
          <Button size="lg" disabled={childName.trim().length === 0} onClick={finish} className={f}>
            {t(lang, "obFinish")} 🎉
          </Button>
        </div>
      )}
    </main>
  );
}
