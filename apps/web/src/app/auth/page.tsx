"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useFamily, CLOUD } from "@/lib/store/family";

/** Sign-in for returning parents (cloud mode). Local mode has no accounts. */
export default function SignInPage() {
  const router = useRouter();
  const lang = useUiLang((s) => s.lang);
  const signIn = useFamily((s) => s.signIn);
  const f = fontFor(lang);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Local mode: there are no accounts — onboarding owns setup.
  if (!CLOUD) {
    return (
      <main className={`flex flex-1 flex-col items-center justify-center gap-6 p-6 ${f}`}>
        <p className="text-ink/70">{t(lang, "obWelcome")}</p>
        <Link href="/onboarding">
          <Button size="lg" className={f}>
            {t(lang, "getStarted")} →
          </Button>
        </Link>
      </main>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.push("/parent");
    } catch {
      setError(t(lang, "authError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`flex flex-1 flex-col items-center justify-center gap-6 p-6 ${f}`}>
      <h1 className="text-3xl font-extrabold">🦓 {t(lang, "signIn")}</h1>
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4">
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
        {error && <p className="font-bold text-rose">{error}</p>}
        <Button type="submit" size="lg" disabled={busy} className={f}>
          {busy ? t(lang, "loading") : t(lang, "signIn")}
        </Button>
      </form>
      <p className="text-ink/60">
        {t(lang, "needAccount")}{" "}
        <Link href="/onboarding" className="font-bold text-teal underline">
          {t(lang, "getStarted")}
        </Link>
      </p>
    </main>
  );
}
