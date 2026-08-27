export type Hold = {
  id: number;
  x: number; // 0..1 across screen width
  y: number; // px up from the bottom of the climb
  size: number; // px
  rot: number; // deg
};

export const CLIMB_HEIGHT = 3600;

// Deterministic pseudo-random so server and client render the same holds.
function rand(seed: number) {
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

export const HOLDS: Hold[] = Array.from({ length: 46 }, (_, i) => {
  const y = 140 + (i / 46) * (CLIMB_HEIGHT - 200) + rand(i + 3) * 60;
  return {
    id: i,
    x: 0.12 + rand(i + 1) * 0.76,
    y,
    size: 34 + rand(i + 2) * 46,
    rot: rand(i + 7) * 360,
  };
});

export const SECTIONS = [
  { id: "projects", label: "Projects", at: 900 },
  { id: "skills", label: "Skills", at: 1900 },
  { id: "contact", label: "Contact", at: 2900 },
] as const;
