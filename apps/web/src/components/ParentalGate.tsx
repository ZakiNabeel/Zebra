"use client";

import { useState } from "react";
import { PinPad } from "@/components/ui/PinPad";
import { Button } from "@/components/ui/Button";
import { t, fontFor, useUiLang } from "@/lib/i18n";
import { useFamily } from "@/lib/store/family";

/**
 * The parental gate: full-screen PIN check between Kid Mode and anything
 * adult (parent dashboard, exiting the app shell). Required by our safety
 * plan and by Apple's Kids Category rules.
 */
export function ParentalGate({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const lang = useUiLang((s) => s.lang);
  const unlockParent = useFamily((s) => s.unlockParent);
  const [wrong, setWrong] = useState(false);

  async function tryPin(pin: string) {
    const ok = await unlockParent(pin);
    if (ok) {
      setWrong(false);
      onSuccess();
    } else {
      setWrong(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-cream/95 backdrop-blur-sm p-6">
      <div className={`text-center ${fontFor(lang)}`}>
        <div className="text-4xl mb-2">🔒</div>
        <h2 className="text-2xl font-bold">{t(lang, "gateTitle")}</h2>
        <p className="text-ink/70 mt-1">{t(lang, "gateAsk")}</p>
        {wrong && <p className="text-rose font-bold mt-2">{t(lang, "gateWrong")}</p>}
      </div>
      <PinPad onComplete={tryPin} shaking={wrong} />
      {onCancel && (
        <Button variant="ghost" onClick={onCancel} className={fontFor(lang)}>
          {t(lang, "cancel")}
        </Button>
      )}
    </div>
  );
}
