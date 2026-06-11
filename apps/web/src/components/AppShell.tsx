"use client";

import { useEffect } from "react";
import { dirFor, useUiLang } from "@/lib/i18n";

/** Applies the UI language's direction & lang to the document root. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const lang = useUiLang((s) => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dirFor(lang);
  }, [lang]);

  return <div className="flex min-h-dvh flex-col">{children}</div>;
}
