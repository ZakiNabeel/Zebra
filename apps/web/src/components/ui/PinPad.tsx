"use client";

import { useState } from "react";
import { PIN_LENGTH } from "@/lib/security/pin";

/**
 * Numeric PIN pad. Used for setting the PIN (onboarding) and the parental
 * gate. Buttons are deliberately large; digits are shown as dots.
 */
export function PinPad({
  onComplete,
  shaking = false,
}: {
  onComplete: (pin: string) => void;
  shaking?: boolean;
}) {
  const [digits, setDigits] = useState<string>("");

  function press(d: string) {
    if (digits.length >= PIN_LENGTH) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
      // small delay so the 4th dot paints before the parent clears/navigates
      setTimeout(() => setDigits(""), 250);
    }
  }

  function backspace() {
    setDigits(digits.slice(0, -1));
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${shaking ? "animate-pulse" : ""}`} dir="ltr">
      <div className="flex gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-ink/30 transition ${
              i < digits.length ? "bg-ink" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => (key === "⌫" ? backspace() : press(key))}
              className="h-16 w-16 rounded-2xl bg-white text-2xl font-bold text-ink shadow-sm border border-ink/10 active:scale-95 transition"
            >
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
