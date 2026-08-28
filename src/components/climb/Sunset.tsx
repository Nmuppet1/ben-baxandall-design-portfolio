/**
 * Sunset that rises behind jagged peaks as you near the top of the climb.
 * `t` is 0..1 — it only starts showing in the last stretch of the wall.
 */
export function Sunset({ t }: { t: number }) {
  const a = Math.min(1, Math.max(0, (t - 0.75) / 0.3));
  if (a <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      style={{ opacity: a }}
      aria-hidden
    >
      {/* sky wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, oklch(0.06 0 0) 30%, oklch(0.22 0.07 45 / 70%) 62%, oklch(0.34 0.11 55 / 55%) 82%, oklch(0.06 0 0) 100%)",
        }}
      />

      {/* sun */}
      <div
        className="absolute left-1/2 rounded-full"
        style={{
          width: "38vmin",
          height: "38vmin",
          bottom: `${35 + a * 24}vmin`,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, var(--warm) 0%, oklch(0.72 0.18 55) 55%, oklch(0.55 0.16 40 / 0%) 72%)",
          filter: "blur(0.5px)",
          animation: "sun-glow 6s ease-in-out infinite",
        }}
      />

      {/* jagged mountains */}
      <svg
        className="absolute inset-x-0 bottom-[40vh] h-[46vh] w-full"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,40 0,26 9,17 15,22 24,9 33,20 41,14 52,27 61,18 70,25 79,12 88,21 100,15 100,40"
          fill="oklch(0.11 0.01 50)"
        />
        <polygon
          points="0,40 0,32 12,24 21,30 30,21 42,31 55,23 66,32 76,25 88,33 100,26 100,40"
          fill="oklch(0.07 0 0)"
        />
      </svg>
    </div>
  );
}
