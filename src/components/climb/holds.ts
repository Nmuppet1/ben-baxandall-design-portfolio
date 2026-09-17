export interface Hold {
  id: number;
  x: number; // 0–1 fraction of wall width
  y: number; // px from the bottom of the wall
  size: number;
  rot: number;
  warm: boolean;
  clip: string;
}

/** A rectangle (in wall coordinates) that holds must stay out of. */
export interface Zone {
  x0: number; // fraction of wall width
  x1: number;
  y0: number; // px from bottom of the wall
  y1: number;
}

// A handful of irregular rock-like shapes, picked at random per hold.
const CLIP_SHAPES = [
  "polygon(20% 0%, 80% 5%, 100% 45%, 85% 100%, 15% 95%, 0% 50%)",
  "polygon(10% 10%, 60% 0%, 100% 30%, 90% 80%, 50% 100%, 0% 70%)",
  "polygon(30% 0%, 100% 20%, 90% 90%, 40% 100%, 0% 60%, 5% 15%)",
  "polygon(0% 30%, 40% 0%, 100% 10%, 95% 70%, 60% 100%, 10% 85%)",
];

const EDGE_MARGIN = 90; // keep holds off the very top/bottom of the wall
const HOLD_SPACING = 90; // roughly one hold per this many px of height
const MIN_GAP = 70; // px of clearance between two holds
const ZONE_PAD_X = 0.02; // fraction of width kept clear around content
const ZONE_PAD_Y = 40; // px kept clear above/below content

const WALL_WIDTH_GUESS = 1200; // only used to turn x-fractions into px for spacing checks

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatters holds across the full width and height of the wall, skipping any
 * rectangle occupied by section content and never letting two holds overlap.
 */
export function generateHolds(height: number, zones: Zone[] = []): Hold[] {
  if (height <= 0) return [];
  const random = seededRandom(20260917);
  const target = Math.max(14, Math.floor(height / HOLD_SPACING));
  const placed: Hold[] = [];

  const collidesWithZone = (x: number, y: number, size: number) => {
    const halfW = size / 2 / WALL_WIDTH_GUESS;
    const halfH = size / 2;
    return zones.some(
      (z) =>
        x + halfW > z.x0 - ZONE_PAD_X &&
        x - halfW < z.x1 + ZONE_PAD_X &&
        y + halfH > z.y0 - ZONE_PAD_Y &&
        y - halfH < z.y1 + ZONE_PAD_Y,
    );
  };

  const collidesWithHold = (x: number, y: number) =>
    placed.some((h) => {
      const dx = (h.x - x) * WALL_WIDTH_GUESS;
      const dy = h.y - y;
      return Math.hypot(dx, dy) < MIN_GAP;
    });

  let id = 0;
  let attempts = 0;
  const maxAttempts = target * 120;

  while (placed.length < target && attempts < maxAttempts) {
    attempts++;
    const size = 32 + random() * 22;
    const x = 0.02 + random() * 0.96;
    const y = EDGE_MARGIN + random() * Math.max(height - EDGE_MARGIN * 2, 1);

    if (collidesWithZone(x, y, size) || collidesWithHold(x, y)) continue;

    placed.push({
      id: id++,
      x,
      y,
      size,
      rot: random() * 36 - 18,
      warm: random() < 0.2,
      clip: CLIP_SHAPES[Math.floor(random() * CLIP_SHAPES.length)]!,
    });
  }

  return placed;
}
