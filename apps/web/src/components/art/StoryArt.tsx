/**
 * Sprint-1 placeholder illustrations: the Zebra cast drawn as simple,
 * friendly SVG scenes. Replaced progressively by real model-sheet art and
 * generated illustrations (with character LoRAs) from sprint 3 onward.
 * Pure SVG — server-renderable, zero runtime cost, works offline.
 */
import type { StoryPage } from "@/lib/content/types";

type Art = StoryPage["art"];

export function StoryArt({ art, className = "" }: { art: Art; className?: string }) {
  const night = art.night ?? false;
  return (
    <svg
      viewBox="0 0 400 260"
      className={`w-full h-auto rounded-3xl ${className}`}
      role="img"
      aria-hidden="true"
    >
      {/* sky + ground */}
      <rect width="400" height="260" fill={night ? "var(--zebra-night)" : "var(--zebra-sky)"} />
      <ellipse cx="200" cy="290" rx="320" ry="80" fill={night ? "#3d4f85" : "var(--zebra-leaf)"} />
      {!night && <circle cx="340" cy="50" r="26" fill="var(--zebra-sunshine)" />}
      {night && <Moon />}
      {night && <Stars count={art.stars ?? 0} />}

      {(art.scene === "zee" || art.scene === "zee-apples" || art.scene === "zee-dada") && (
        <Zebra x={art.scene === "zee" ? 150 : 90} y={120} />
      )}
      {art.scene === "zee-apples" && <AppleTree x={270} y={40} />}
      {(art.scene === "dada" || art.scene === "zee-dada") && (
        <Tortoise x={art.scene === "dada" ? 150 : 250} y={170} />
      )}
      {art.scene === "mano" && (
        <>
          <Markhor x={220} y={110} />
          <Zebra x={80} y={120} />
        </>
      )}
      {art.scene === "sitara-stars" && <SnowLeopard x={140} y={140} />}
    </svg>
  );
}

function Moon() {
  return <circle cx="345" cy="48" r="22" fill="#f4f1de" />;
}

function Stars({ count }: { count: number }) {
  const spots = [
    [40, 40], [110, 25], [180, 55], [250, 30], [310, 80],
    [70, 90], [150, 100], [230, 95], [370, 35],
  ];
  return (
    <g fill="var(--zebra-sunshine)">
      {spots.slice(0, count).map(([x, y], i) => (
        <path
          key={i}
          transform={`translate(${x},${y}) scale(0.9)`}
          d="M0,-10 L2.9,-3.1 10,-3.1 4.5,1.2 6.9,8.1 0,4 -6.9,8.1 -4.5,1.2 -10,-3.1 -2.9,-3.1 Z"
        />
      ))}
    </g>
  );
}

/** Zee — chibi zebra: white body, bold stripes, mango mane. */
function Zebra({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* body */}
      <ellipse cx="0" cy="60" rx="52" ry="38" fill="#fff" stroke="#2d2a32" strokeWidth="3" />
      {/* stripes */}
      <path d="M-30,30 q6,28 0,56" stroke="#2d2a32" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M-8,26 q6,32 0,66" stroke="#2d2a32" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M14,28 q6,30 0,60" stroke="#2d2a32" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* legs */}
      <rect x="-38" y="88" width="12" height="26" rx="6" fill="#fff" stroke="#2d2a32" strokeWidth="3" />
      <rect x="26" y="88" width="12" height="26" rx="6" fill="#fff" stroke="#2d2a32" strokeWidth="3" />
      {/* head */}
      <circle cx="38" cy="6" r="30" fill="#fff" stroke="#2d2a32" strokeWidth="3" />
      {/* muzzle */}
      <ellipse cx="52" cy="16" rx="14" ry="10" fill="#f2e8da" stroke="#2d2a32" strokeWidth="2.5" />
      {/* mane */}
      <path d="M14,-18 q10,-16 26,-14 q-2,10 4,12 q-14,6 -20,16 Z" fill="var(--zebra-mango)" stroke="#2d2a32" strokeWidth="2.5" />
      {/* ears */}
      <ellipse cx="20" cy="-20" rx="7" ry="12" fill="#fff" stroke="#2d2a32" strokeWidth="2.5" transform="rotate(-20 20 -20)" />
      {/* eye + smile */}
      <circle cx="40" cy="0" r="4" fill="#2d2a32" />
      <path d="M46,22 q6,5 12,0" stroke="#2d2a32" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* tail */}
      <path d="M-50,50 q-14,4 -10,18" stroke="#2d2a32" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Dada Kachwa — wise old tortoise. */
function Tortoise({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="20" rx="46" ry="30" fill="var(--zebra-leaf)" stroke="#2d2a32" strokeWidth="3" />
      <path d="M-26,4 q10,-14 26,-14 q16,0 26,14" fill="#5e8a4f" stroke="#2d2a32" strokeWidth="2.5" />
      <circle cx="-14" cy="16" r="7" fill="#5e8a4f" stroke="#2d2a32" strokeWidth="2" />
      <circle cx="10" cy="20" r="7" fill="#5e8a4f" stroke="#2d2a32" strokeWidth="2" />
      {/* head */}
      <circle cx="50" cy="10" r="16" fill="#a8c98a" stroke="#2d2a32" strokeWidth="3" />
      <circle cx="54" cy="6" r="3" fill="#2d2a32" />
      <path d="M56,16 q4,3 8,0" stroke="#2d2a32" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* round glasses — he's the storyteller */}
      <circle cx="54" cy="6" r="7" fill="none" stroke="#2d2a32" strokeWidth="1.8" />
      {/* feet */}
      <ellipse cx="-30" cy="48" rx="10" ry="7" fill="#a8c98a" stroke="#2d2a32" strokeWidth="2.5" />
      <ellipse cx="24" cy="48" rx="10" ry="7" fill="#a8c98a" stroke="#2d2a32" strokeWidth="2.5" />
    </g>
  );
}

/** Mano — brave markhor with spiral horns. */
function Markhor({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="60" rx="44" ry="34" fill="#c9a47e" stroke="#2d2a32" strokeWidth="3" />
      <rect x="-30" y="86" width="11" height="24" rx="5" fill="#c9a47e" stroke="#2d2a32" strokeWidth="2.5" />
      <rect x="20" y="86" width="11" height="24" rx="5" fill="#c9a47e" stroke="#2d2a32" strokeWidth="2.5" />
      <circle cx="34" cy="10" r="26" fill="#c9a47e" stroke="#2d2a32" strokeWidth="3" />
      {/* spiral horns */}
      <path d="M24,-12 q-8,-22 6,-34 q2,12 12,16" fill="none" stroke="#7a5c3e" strokeWidth="6" strokeLinecap="round" />
      <path d="M42,-10 q2,-20 16,-26 q-2,10 4,16" fill="none" stroke="#7a5c3e" strokeWidth="6" strokeLinecap="round" />
      {/* beard */}
      <path d="M44,32 q2,12 -6,16 q-2,-10 -6,-12 Z" fill="#7a5c3e" stroke="#2d2a32" strokeWidth="2" />
      <circle cx="38" cy="6" r="4" fill="#2d2a32" />
      <path d="M42,20 q5,4 10,0" stroke="#2d2a32" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Sitara — dreamy snow leopard who loves the night sky. */
function SnowLeopard({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="50" rx="50" ry="34" fill="#d9dde3" stroke="#2d2a32" strokeWidth="3" />
      {/* spots */}
      <circle cx="-22" cy="42" r="5" fill="#8b93a1" />
      <circle cx="0" cy="58" r="5" fill="#8b93a1" />
      <circle cx="20" cy="44" r="5" fill="#8b93a1" />
      {/* long tail */}
      <path d="M-48,44 q-26,-2 -28,-26 q14,2 18,-8" fill="none" stroke="#8b93a1" strokeWidth="9" strokeLinecap="round" />
      {/* head looking up */}
      <circle cx="36" cy="0" r="27" fill="#d9dde3" stroke="#2d2a32" strokeWidth="3" />
      <ellipse cx="22" cy="-22" rx="8" ry="9" fill="#d9dde3" stroke="#2d2a32" strokeWidth="2.5" />
      <ellipse cx="52" cy="-18" rx="8" ry="9" fill="#d9dde3" stroke="#2d2a32" strokeWidth="2.5" />
      {/* upward gaze */}
      <circle cx="34" cy="-6" r="4" fill="#2d2a32" />
      <circle cx="48" cy="-8" r="4" fill="#2d2a32" />
      <path d="M38,8 q5,4 10,0" stroke="#2d2a32" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="42" cy="2" r="2.5" fill="#8b93a1" />
      {/* paws */}
      <ellipse cx="-26" cy="80" rx="11" ry="8" fill="#d9dde3" stroke="#2d2a32" strokeWidth="2.5" />
      <ellipse cx="22" cy="80" rx="11" ry="8" fill="#d9dde3" stroke="#2d2a32" strokeWidth="2.5" />
    </g>
  );
}

function AppleTree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="38" y="80" width="18" height="60" rx="8" fill="#8a5a3b" stroke="#2d2a32" strokeWidth="3" />
      <circle cx="48" cy="50" r="48" fill="#6da34d" stroke="#2d2a32" strokeWidth="3" />
      <circle cx="20" cy="40" r="9" fill="#e63946" stroke="#2d2a32" strokeWidth="2" />
      <circle cx="58" cy="22" r="9" fill="#e63946" stroke="#2d2a32" strokeWidth="2" />
      <circle cx="76" cy="58" r="9" fill="#e63946" stroke="#2d2a32" strokeWidth="2" />
      <circle cx="40" cy="70" r="9" fill="#e63946" stroke="#2d2a32" strokeWidth="2" />
    </g>
  );
}
