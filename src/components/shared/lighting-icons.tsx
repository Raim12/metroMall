import { LampCeiling, LampDesk, LampFloor, LampWallUp, type LucideProps } from "lucide-react";

import type { CategorySlug } from "@/types";

/**
 * Icons for the lighting and electrical categories. Lucide covers the lamps;
 * it has no recessed down light, floodlight or switch plate, so those three
 * are drawn here in Lucide's style (24px grid, 2px round strokes) so they sit
 * side by side with the rest.
 */
function Svg({ children, strokeWidth = 2, ...props }: LucideProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Recessed ceiling fixture with light falling straight down. */
export function DownLightIcon(props: LucideProps) {
  return (
    <Svg {...props}>
      <path d="M3 4h18" />
      <path d="M8 4v1.5a4 4 0 0 0 8 0V4" />
      <path d="M12 12v4" />
      <path d="m8.5 11.5-2 3.5" />
      <path d="m15.5 11.5 2 3.5" />
      <path d="M7 20h10" />
    </Svg>
  );
}

/** Front-facing LED floodlight panel on its mounting bracket. */
export function FloodLightIcon(props: LucideProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="12" rx="2" />
      <path d="M7 7h10" />
      <path d="M7 11h10" />
      <path d="M12 15v3" />
      <path d="M8 21h8" />
      <path d="M9.5 18h5" />
    </Svg>
  );
}

/** Wall switch plate with a rocker. */
export function SwitchIcon(props: LucideProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="9" y="7" width="6" height="10" rx="1" />
      <path d="M9 12h6" />
    </Svg>
  );
}

export const CATEGORY_ICONS: Partial<Record<CategorySlug, React.ComponentType<LucideProps>>> = {
  "table-lamps": LampDesk,
  "stand-lamps": LampFloor,
  "wall-lights": LampWallUp,
  chandeliers: LampCeiling,
  "down-lights": DownLightIcon,
  "outdoor-lights": FloodLightIcon,
  "electric-switches": SwitchIcon,
};
