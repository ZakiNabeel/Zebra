"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PinPad } from "@/components/ui/PinPad";
import { t, fontFor, useUiLang, type Lang } from "@/lib/i18n";
import { useFamily, CLOUD } from "@/lib/store/family";
import type { AgeBand, StoryLang } from "@/lib/content/types";

const AVATARS = ["🦓", "🐢", "🐆", "🐬", "🦜", "⭐", "🌙", "🚀"];

type Step = "account" | "family" | "pin" | "confirmPin" | "child";

export default function OnboardingPage() {
  const router = useRouter();
  const { lang, setLang } = useUiLang();
  const { signUp, createFamily, addProfile } = useFamily();
  const f = fontFor(lang);

  // Cloud mode starts with account creation; local mode skips straight to family.
  const [step, setStep] = useState<Step>(CLOUD ? "account" : "family");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);
  const [busy, setBusy] = useState(false);

  const [familyName, setFamilyName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [childName, setChildName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("3-5");
  const [storyLang, setStoryLang] = useState<StoryLang>("ur");
  const [avatar, setAvatar] = useState(AVATARS[0]);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (password.length < 6) {
      setAuthError(t(lang, "weakPassword"));
      return;
    }
    setBusy(true);
    try {
      const { hasSession } = await signUp(email.trim(), password);
      if (hasSession) setStep("family");
      else setConfirmNotice(true); // email-confirmation is on; tell them to confirm
    } catch {
      setAuthError(t(lang, "authError"));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      await createFamily(familyName.trim(), pin);
      await addProfile({ name: childName.trim(), ageBand, language: storyLang, avatar });
      router.push("/parent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`flex flex-1 flex-col items-center justify-center gap-8 p-6 ${f}`}>
      <h1 className="text-3xl font-extrabold">🦓 {t(lang, "obWelcome")}</h1>

      {step === "account" && (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <p className="text-lg font-bold">{t(lang, "obAccount")}</p>
          {confirmNotice ? (
            <>
              <p className="rounded-2xl bg-sunshine/30 px-4 py-3">{t(lang, "confirmEmail")}</p>
              <Link href="/auth">
                <Button size="lg" className={`w-full ${f}`}>
                  {t(lang, "signIn")} →
                </Button>
              </Link>
            </>
          ) : (
            <form onSubmit={createAccount} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t(lang, "email")}
                className="rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg outline-none focus:border-teal"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t(lang, "password")}
                className="rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg outline-none focus:border-teal"
              />
              {authError && <p className="font-bold text-rose">{authError}</p>}
              <Button type="submit" size="lg" disabled={busy} className={f}>
                {busy ? t(lang, "loading") : t(lang, "createAccount")}
              </Button>
              <p className="text-center text-ink/60">
                {t(lang, "haveAccount")}{" "}
                <Link href="/auth" className="font-bold text-teal underline">
                  {t(lang, "signIn")}
                </Link>
              </p>
            </form>
          )}
        </div>
      )}

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
          <Button size="lg" disabled={childName.trim().length === 0 || busy} onClick={finish} className={f}>
            {busy ? t(lang, "loading") : `${t(lang, "obFinish")} 🎉`}
          </Button>
        </div>
      )}
    </main>
  );
}
