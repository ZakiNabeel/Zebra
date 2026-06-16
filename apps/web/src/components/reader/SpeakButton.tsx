"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/**
 * Read-along narration. $0 path: the browser Web Speech API (no key, offline on
 * many devices). When the TTS pipeline pre-generates Azure audio it lands in
 * `page.audio[lang]` and is played instead — same button, better voice. Stops
 * automatically on page turn / unmount.
 */
export function SpeakButton({
  text,
  lang,
  audioUrl,
  className = "",
}: {
  text: string;
  lang: Lang;
  audioUrl?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Stop whenever the page/text changes, and on unmount.
  useEffect(() => {
    stop();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, lang, audioUrl]);

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }

  function speak() {
    if (speaking) return stop();

    if (audioUrl) {
      const a = new Audio(audioUrl);
      audioRef.current = a;
      a.onended = () => setSpeaking(false);
      a.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false));
      return;
    }

    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ur" ? "ur-PK" : "en-US";
    const match = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(lang === "ur" ? "ur" : "en"));
    if (match) u.voice = match;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  // Render nothing until mounted (avoids hydration mismatch) or if unsupported.
  if (!mounted) return null;
  const supported = !!audioUrl || "speechSynthesis" in window;
  if (!supported) return null;

  return (
    <button
      onClick={speak}
      aria-label={t(lang, speaking ? "stopAudio" : "listen")}
      className={`inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-lg font-bold text-ink border border-ink/10 active:translate-y-0.5 ${className}`}
    >
      {speaking ? `⏹ ${t(lang, "stopAudio")}` : `🔊 ${t(lang, "listen")}`}
    </button>
  );
}
