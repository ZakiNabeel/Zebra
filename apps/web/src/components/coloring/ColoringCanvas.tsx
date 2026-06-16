"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { t, fontFor, type Lang } from "@/lib/i18n";
import { PALETTE, type ColoringPage, type Region } from "@/lib/art/coloring-pages";
import { useGallery } from "@/lib/store/gallery";

const UNPAINTED = "#ffffff";

/** Read-only / interactive SVG renderer for a coloring page + its fill map. */
export function PageSvg({
  page,
  fills,
  onFill,
  className = "",
}: {
  page: ColoringPage;
  fills: Record<string, string>;
  onFill?: (id: string) => void;
  className?: string;
}) {
  const common = (r: Region) => ({
    fill: fills[r.id] ?? UNPAINTED,
    stroke: "#2d2a32",
    strokeWidth: 2.5,
    onClick: onFill ? () => onFill(r.id) : undefined,
    style: onFill ? { cursor: "pointer" } : undefined,
  });
  return (
    <svg viewBox={page.viewBox} className={className} role="img" aria-label={page.name.en}>
      {page.regions.map((r) => {
        switch (r.kind) {
          case "rect":
            return <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx} {...common(r)} />;
          case "circle":
            return <circle key={r.id} cx={r.cx} cy={r.cy} r={r.r} {...common(r)} />;
          case "ellipse":
            return <ellipse key={r.id} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} {...common(r)} />;
          case "polygon":
            return <polygon key={r.id} points={r.points} {...common(r)} />;
          case "path":
            return <path key={r.id} d={r.d} transform={r.transform} {...common(r)} />;
        }
      })}
    </svg>
  );
}

/** The interactive coloring surface: palette, tap-to-fill, undo, clear, save. */
export function ColoringCanvas({
  page,
  profileId,
  lang,
  onSaved,
}: {
  page: ColoringPage;
  profileId: string;
  lang: Lang;
  onSaved?: () => void;
}) {
  const f = fontFor(lang);
  const save = useGallery((s) => s.save);
  const [color, setColor] = useState(PALETTE[0]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, string>[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  function fill(id: string) {
    setHistory((h) => [...h, fills]);
    setFills((cur) => ({ ...cur, [id]: color }));
  }
  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setFills(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }
  function clear() {
    setHistory((h) => [...h, fills]);
    setFills({});
  }
  function doSave() {
    save(profileId, { id: crypto.randomUUID(), pageId: page.id, fills, at: Date.now() });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    onSaved?.();
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${f}`}>
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white border border-ink/10">
        <PageSvg page={page} fills={fills} onFill={fill} className="h-auto w-full" />
      </div>

      {/* Palette */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-sm font-bold text-ink/60">{t(lang, "colChoose")}</span>
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={c}
            className={`h-9 w-9 rounded-full border-2 transition ${
              color === c ? "border-ink scale-110" : "border-ink/15"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" onClick={undo} disabled={history.length === 0} className={f}>
          ↩ {t(lang, "colUndo")}
        </Button>
        <Button variant="ghost" onClick={clear} className={f}>
          🧽 {t(lang, "colClear")}
        </Button>
        <Button onClick={doSave} className={f}>
          💾 {t(lang, "colSave")}
        </Button>
      </div>
      {savedFlash && <p className="font-bold text-leaf">✅ {t(lang, "colSaved")}</p>}
    </div>
  );
}
