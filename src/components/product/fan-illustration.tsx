import * as React from "react";
import { cn } from "@/lib/utils";
import type { FanVariant } from "@/types";

/**
 * Parametric fan artwork.
 *
 * Phase 1 ships without photography, so every product renders as a generated
 * SVG driven by its colourway â€” which means the colour swatches on the
 * catalogue and product pages change the actual image. Products that later
 * gain real photos set `images[]` and the callers render an <Image> instead.
 */

/** Lighten (amount > 0) or darken (amount < 0) a hex colour. */
function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const num = parseInt(full, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const mix = (channel: number) =>
    Math.round(
      amount >= 0
        ? channel + (255 - channel) * amount
        : channel * (1 + amount),
    );

  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0"))
    .join("")}`;
}

interface FanIllustrationProps {
  variant: FanVariant;
  color: string;
  trim: string;
  className?: string;
  /** Adds a slow idle rotation to the blade group. */
  spin?: boolean;
  title?: string;
}

export function FanIllustration({
  variant,
  color,
  trim,
  className,
  spin = false,
  title,
}: FanIllustrationProps) {
  const uid = React.useId().replace(/:/g, "");
  const blade = `blade-${uid}`;
  const hub = `hub-${uid}`;
  const metal = `metal-${uid}`;

  const light = shade(color, 0.22);
  const dark = shade(color, -0.28);
  const deep = shade(color, -0.45);

  return (
    <svg
      viewBox="0 0 400 400"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={title ?? "Fan illustration"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={blade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <radialGradient id={hub} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor={light} />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
        <linearGradient id={metal} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(trim, 0.35)} />
          <stop offset="50%" stopColor={trim} />
          <stop offset="100%" stopColor={shade(trim, -0.3)} />
        </linearGradient>
      </defs>

      {/*
        No `feDropShadow` here on purpose. A filter forces the browser to
        rasterize the whole subtree through a Gaussian blur, and when a spinning
        group sits inside it that happens on the main thread every frame. Depth
        comes from the gradients and the tile background instead.
      */}

      {variant === "ceiling-3" && (
        <CeilingFan blades={3} ids={{ blade, hub, metal }} spin={spin} />
      )}
      {variant === "ceiling-5" && (
        <CeilingFan blades={5} ids={{ blade, hub, metal }} spin={spin} />
      )}
      {variant === "ceiling-8" && (
        <CeilingFan blades={8} ids={{ blade, hub, metal }} spin={spin} />
      )}
      {variant === "pedestal" && (
        <PedestalFan ids={{ blade, hub, metal }} trim={trim} spin={spin} />
      )}
      {variant === "exhaust" && (
        <ExhaustFan ids={{ blade, hub, metal }} trim={trim} spin={spin} />
      )}
      {variant === "false-ceiling" && (
        <FalseCeilingFan ids={{ blade, hub, metal }} trim={trim} spin={spin} />
      )}
      {variant === "bracket" && (
        <BracketFan ids={{ blade, hub, metal }} trim={trim} spin={spin} />
      )}
      {variant === "socket-light" && (
        <SocketLightFan ids={{ blade, hub, metal }} trim={trim} spin={spin} />
      )}
    </svg>
  );
}

type Ids = { blade: string; hub: string; metal: string };

/**
 * Rotates its children.
 *
 * Uses a CSS animation rather than SMIL `<animateTransform>`: CSS transforms
 * are composited on the GPU, while SMIL drives the main thread and re-rasterizes
 * the subtree each frame. `.fan-spin` also honours `prefers-reduced-motion`, and
 * is paused automatically while its section is offscreen (`content-visibility`).
 */
function Spin({
  spin,
  children,
  duration = "14s",
}: {
  spin: boolean;
  children: React.ReactNode;
  duration?: string;
}) {
  if (!spin) return <>{children}</>;
  return (
    <g className="fan-spin" style={{ animationDuration: duration }}>
      {children}
    </g>
  );
}

/* ---------------------------- Ceiling fans ---------------------------- */

function CeilingFan({
  blades,
  ids,
  spin,
}: {
  blades: number;
  ids: Ids;
  spin: boolean;
}) {
  const angles = Array.from({ length: blades }, (_, i) => (360 / blades) * i);
  // Narrower blades once there are many of them.
  const wide = blades <= 3;

  return (
    <g>
      <Spin spin={spin}>
        {angles.map((a) => (
          <g key={a} transform={`rotate(${a} 200 200)`}>
            <path
              d={
                wide
                  ? "M186 168 C179 116 172 74 179 44 Q182 30 200 28 Q218 30 221 44 C228 74 221 116 214 168 Z"
                  : "M190 168 C185 118 180 76 185 48 Q188 34 200 32 Q212 34 215 48 C220 76 215 118 210 168 Z"
              }
              fill={`url(#${ids.blade})`}
            />
            {/* Trim detail near the blade tip */}
            <ellipse
              cx="200"
              cy={wide ? 72 : 74}
              rx={wide ? 14 : 9}
              ry={wide ? 23 : 17}
              fill="none"
              stroke={`url(#${ids.metal})`}
              strokeWidth={wide ? 7 : 5}
            />
            {/* Soft highlight along the leading edge */}
            <path
              d={
                wide
                  ? "M188 164 C182 116 176 76 182 48"
                  : "M191 164 C187 118 183 78 187 50"
              }
              stroke="#ffffff"
              strokeOpacity="0.25"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
      </Spin>

      {/* Motor housing */}
      <circle cx="200" cy="200" r="52" fill={`url(#${ids.hub})`} />
      <circle
        cx="200"
        cy="200"
        r="52"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="6"
      />
      <circle cx="200" cy="200" r="30" fill={`url(#${ids.hub})`} />
      <circle
        cx="200"
        cy="200"
        r="30"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="3"
        strokeOpacity="0.7"
      />
      <circle cx="188" cy="188" r="9" fill="#ffffff" fillOpacity="0.22" />
    </g>
  );
}

/* ---------------------------- Pedestal fan ---------------------------- */

function PedestalFan({ ids, trim, spin }: { ids: Ids; trim: string; spin: boolean }) {
  return (
    <g>
      {/* Base */}
      <ellipse cx="200" cy="364" rx="86" ry="20" fill={`url(#${ids.hub})`} />
      <ellipse cx="200" cy="356" rx="86" ry="20" fill={`url(#${ids.blade})`} />
      {/* Column */}
      <rect x="190" y="212" width="20" height="146" rx="10" fill={`url(#${ids.metal})`} />
      <rect x="195" y="212" width="5" height="146" fill="#ffffff" fillOpacity="0.28" />

      {/* Guard + blades */}
      <g transform="translate(0,-24)">
        <circle cx="200" cy="176" r="118" fill="#ffffff" fillOpacity="0.55" />
        <Spin spin={spin} duration="6s">
          <g transform="translate(0,24)">
            {[0, 72, 144, 216, 288].map((a) => (
              <path
                key={a}
                transform={`rotate(${a} 200 152)`}
                d="M200 152 C224 148 244 126 246 100 C248 78 228 66 210 78 C196 88 194 122 200 152 Z"
                fill={`url(#${ids.blade})`}
              />
            ))}
          </g>
        </Spin>
        <circle cx="200" cy="176" r="26" fill={`url(#${ids.hub})`} />
        <circle
          cx="200"
          cy="176"
          r="26"
          fill="none"
          stroke={`url(#${ids.metal})`}
          strokeWidth="4"
        />
        {/* Wire guard rings */}
        {[118, 92, 66, 40].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="176"
            r={r}
            fill="none"
            stroke={trim}
            strokeOpacity="0.55"
            strokeWidth="2.5"
          />
        ))}
        <circle
          cx="200"
          cy="176"
          r="118"
          fill="none"
          stroke={`url(#${ids.metal})`}
          strokeWidth="7"
        />
      </g>
    </g>
  );
}

/* ---------------------------- Exhaust fan ----------------------------- */

function ExhaustFan({ ids, trim, spin }: { ids: Ids; trim: string; spin: boolean }) {
  return (
    <g>
      <rect
        x="52"
        y="52"
        width="296"
        height="296"
        rx="26"
        fill={`url(#${ids.blade})`}
      />
      <rect
        x="52"
        y="52"
        width="296"
        height="296"
        rx="26"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="6"
      />
      <circle cx="200" cy="200" r="120" fill="#ffffff" fillOpacity="0.5" />
      <circle
        cx="200"
        cy="200"
        r="120"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="5"
      />

      <Spin spin={spin} duration="4s">
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            transform={`rotate(${a} 200 200)`}
            d="M200 200 C230 196 254 172 254 142 C254 116 228 106 210 122 C194 136 192 172 200 200 Z"
            fill={`url(#${ids.blade})`}
            fillOpacity="0.95"
          />
        ))}
      </Spin>

      <circle cx="200" cy="200" r="30" fill={`url(#${ids.hub})`} />
      <circle
        cx="200"
        cy="200"
        r="30"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="4"
      />

      {/* Louvre slats hinted at the bottom */}
      {[300, 318, 336].map((y) => (
        <rect
          key={y}
          x="96"
          y={y}
          width="208"
          height="7"
          rx="3.5"
          fill={trim}
          fillOpacity="0.4"
        />
      ))}
      {/* Corner fixings */}
      {[
        [82, 82],
        [318, 82],
        [82, 318],
        [318, 318],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill={trim} fillOpacity="0.75" />
      ))}
    </g>
  );
}

/* ------------------------- False-ceiling cassette ---------------------- */

function FalseCeilingFan({ ids, trim, spin }: { ids: Ids; trim: string; spin: boolean }) {
  return (
    <g>
      <rect
        x="46"
        y="46"
        width="308"
        height="308"
        rx="20"
        fill={`url(#${ids.blade})`}
      />
      <rect
        x="46"
        y="46"
        width="308"
        height="308"
        rx="20"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="6"
      />
      <rect
        x="74"
        y="74"
        width="252"
        height="252"
        rx="14"
        fill="#ffffff"
        fillOpacity="0.45"
      />

      {/* LED diffuser ring */}
      <circle
        cx="200"
        cy="200"
        r="126"
        fill="none"
        stroke={trim}
        strokeOpacity="0.55"
        strokeWidth="12"
      />
      <circle cx="200" cy="200" r="110" fill="#ffffff" fillOpacity="0.7" />

      <Spin spin={spin} duration="8s">
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            transform={`rotate(${a} 200 200)`}
            d="M200 200 C232 194 258 166 256 132 C255 108 228 100 210 118 C192 136 192 174 200 200 Z"
            fill={`url(#${ids.blade})`}
          />
        ))}
      </Spin>

      <circle cx="200" cy="200" r="34" fill={`url(#${ids.hub})`} />
      <circle
        cx="200"
        cy="200"
        r="34"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="4"
      />
    </g>
  );
}

/* ---------------------------- Bracket fan ----------------------------- */

function BracketFan({ ids, trim, spin }: { ids: Ids; trim: string; spin: boolean }) {
  return (
    <g>
      {/* Wall plate + arm */}
      <rect x="28" y="132" width="34" height="136" rx="10" fill={`url(#${ids.metal})`} />
      {[156, 200, 244].map((cy) => (
        <circle key={cy} cx="45" cy={cy} r="6" fill="#ffffff" fillOpacity="0.45" />
      ))}
      <rect x="58" y="188" width="74" height="24" rx="12" fill={`url(#${ids.metal})`} />

      {/* Guard + blades */}
      <circle cx="238" cy="200" r="130" fill="#ffffff" fillOpacity="0.55" />
      <Spin spin={spin} duration="5s">
        <g transform="translate(38,0)">
          {[0, 90, 180, 270].map((a) => (
            <path
              key={a}
              transform={`rotate(${a} 200 200)`}
              d="M200 200 C234 194 262 166 260 130 C259 104 228 96 210 116 C192 136 192 172 200 200 Z"
              fill={`url(#${ids.blade})`}
            />
          ))}
        </g>
      </Spin>
      <circle cx="238" cy="200" r="30" fill={`url(#${ids.hub})`} />
      <circle
        cx="238"
        cy="200"
        r="30"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="4"
      />
      {[130, 102, 74, 46].map((r) => (
        <circle
          key={r}
          cx="238"
          cy="200"
          r={r}
          fill="none"
          stroke={trim}
          strokeOpacity="0.5"
          strokeWidth="2.5"
        />
      ))}
      <circle
        cx="238"
        cy="200"
        r="130"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="7"
      />
    </g>
  );
}

/* ------------------------- Socket light + fan ------------------------- */

function SocketLightFan({ ids, trim, spin }: { ids: Ids; trim: string; spin: boolean }) {
  return (
    <g>
      {/* E27 screw base */}
      <rect x="176" y="40" width="48" height="18" rx="7" fill={`url(#${ids.metal})`} />
      <rect x="172" y="58" width="56" height="16" rx="6" fill={`url(#${ids.metal})`} />
      <rect x="168" y="74" width="64" height="16" rx="6" fill={`url(#${ids.metal})`} />
      {/* Body */}
      <path
        d="M156 90 H244 L262 150 H138 Z"
        fill={`url(#${ids.hub})`}
      />

      {/* Blades */}
      <Spin spin={spin} duration="7s">
        <g transform="translate(0,26)">
          {[0, 120, 240].map((a) => (
            <path
              key={a}
              transform={`rotate(${a} 200 174)`}
              d="M200 174 C236 168 268 142 266 110 C265 88 234 82 214 100 C194 118 192 148 200 174 Z"
              fill={`url(#${ids.blade})`}
              fillOpacity="0.92"
            />
          ))}
        </g>
      </Spin>

      {/* Light disc */}
      <ellipse cx="200" cy="268" rx="118" ry="44" fill={`url(#${ids.blade})`} />
      <ellipse cx="200" cy="260" rx="118" ry="44" fill="#ffffff" fillOpacity="0.82" />
      <ellipse
        cx="200"
        cy="260"
        rx="118"
        ry="44"
        fill="none"
        stroke={`url(#${ids.metal})`}
        strokeWidth="5"
      />
      <ellipse cx="200" cy="256" rx="86" ry="30" fill={trim} fillOpacity="0.32" />
      <ellipse cx="176" cy="248" rx="30" ry="12" fill="#ffffff" fillOpacity="0.75" />
    </g>
  );
}
