export type Hold = {
  id: number;
  x: number; // 0..1 across screen width
  y: number; // px up from the bottom of the climb
  size: number; // px
  rot: number; // deg
  clip: string; // css clip-path polygon
  warm: boolean; // accent-coloured hold
};

export const CLIMB_HEIGHT = 3400;

// Deterministic pseudo-random so server and client render the same holds.
function rand(seed: number) {
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

// A small set of hand-made "feels random" shapes: triangles, squished squares,
// irregular circles, crimps and slopers.
const SHAPES = [
  "polygon(50% 0%, 96% 82%, 6% 90%)", // triangle
  "polygon(12% 4%, 92% 0%, 100% 78%, 4% 96%)", // squished square
  "polygon(30% 2%, 78% 8%, 100% 46%, 82% 92%, 26% 96%, 0% 52%)", // irregular circle
  "polygon(6% 30%, 44% 0%, 98% 22%, 88% 84%, 22% 100%)", // sloper
  "polygon(0% 22%, 62% 0%, 100% 40%, 54% 100%)", // pinch
  "polygon(10% 10%, 90% 18%, 74% 96%, 26% 84%)", // crimp
  "polygon(50% 4%, 100% 34%, 80% 100%, 18% 92%, 0% 36%)", // jug
];

export const HOLDS: Hold[] = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  return {
    id: i,
    x: r(0.12 + rand(i + 1) * 0.76, 4),
    y: r(560 + (i / 46) * (CLIMB_HEIGHT - 200) + rand(i + 3) * 60),
    size: r(34 + rand(i + 2) * 46),
    rot: r(rand(i + 7) * 360),
    clip: SHAPES[i % SHAPES.length]!,
    //warm: rand(i + 11) > 0.78,
    warm: i < 0,
  };
});

export const SECTIONS = [
  { id: "projects", label: "Projects", at: 900 },
  { id: "skills", label: "Skills", at: 1900 },
  { id: "contact", label: "Contact", at: 2900 },
] as const;
