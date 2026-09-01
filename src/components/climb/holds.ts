export interface Hold {
  id: number;
  x: number; // 0–1 fraction of wall width
  y: number; // px from the bottom of the wall
  size: number;
  rot: number;
  warm: boolean;
  clip: string;
}

// A handful of irregular rock-like shapes, picked at random per hold.
// If you have real hold artwork/clip-paths already, swap this array for
// those and everything else here keeps working unchanged.
const CLIP_SHAPES = [
  "polygon(20% 0%, 80% 5%, 100% 45%, 85% 100%, 15% 95%, 0% 50%)",
  "polygon(10% 10%, 60% 0%, 100% 30%, 90% 80%, 50% 100%, 0% 70%)",
  "polygon(30% 0%, 100% 20%, 90% 90%, 40% 100%, 0% 60%, 5% 15%)",
  "polygon(0% 30%, 40% 0%, 100% 10%, 95% 70%, 60% 100%, 10% 85%)",
];

const EDGE_MARGIN = 100; // keep holds off the very top/bottom of the wall
const HOLD_SPACING = 100; // roughly one hold per this many px of height

/**
 * Scatters holds across the full height of the wall. Call this with the
 * wall's *measured* height (see Index.tsx) rather than a hardcoded
 * constant, so holds always cover however tall the page ends up being.
 */
export function generateHolds(height: number): Hold[] {
  if (height <= 0) return [];
  const count = Math.max(12, Math.floor(height / HOLD_SPACING));

  return Array.from({ length: count }, (_, i) => {
    // Keep holds in the left/right gutters so they never sit on top of a
    // section's content.
    const left = i % 2 === 0;
    const x = left ? 0.025 + Math.random() * 0.075 : 0.9 + Math.random() * 0.075;

    return {
      id: i,
      x,
      y: EDGE_MARGIN + Math.random() * Math.max(height - EDGE_MARGIN * 2, 1),
      size: 34 + Math.random() * 20,
      rot: Math.random() * 36 - 18,
      warm: Math.random() < 0.2,
      clip: CLIP_SHAPES[Math.floor(Math.random() * CLIP_SHAPES.length)]!,
    };
  });
}
