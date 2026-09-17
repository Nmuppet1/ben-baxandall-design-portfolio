/**
 * Sunset that rises behind jagged peaks as you near the top of the climb.
 * `t` is 0..1 — it only starts showing in the last stretch of the wall.
 */
export function Sunset({ t }: { t: number }) {
  const a = Math.min(1, Math.max(0, (t - 0.90) / 0.3));
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
        <g fill="oklch(0.055 0 0)">
          <circle cx="77.8" cy="8.9" r="0.72" />
          <path d="M77.25 9.55 L78.35 9.55 L78.65 13.25 L77.05 13.25 Z M77.15 10.2 L75.9 12.25 L76.45 12.55 L77.65 10.95 Z M78.25 10.25 L79.75 11.85 L80.2 11.4 L78.65 9.95 Z M77.45 13 L76.6 15.45 L77.2 15.55 L78.05 13.35 Z M78.05 13.2 L79.25 15.25 L79.8 14.95 L78.65 12.85 Z" />
          <circle cx="81.5" cy="9.65" r="0.64" />
          <path d="M81 10.25 L82 10.25 L82.25 13.55 L80.82 13.55 Z M80.95 10.85 L79.75 12.45 L80.2 12.8 L81.4 11.4 Z M81.9 10.8 L83.1 9.75 L83.45 10.2 L82.15 11.5 Z M81.05 13.25 L80.2 15.45 L80.75 15.55 L81.55 13.55 Z M81.65 13.4 L82.7 15.35 L83.2 15.05 L82.2 13.15 Z" />
        </g>
      </svg>
    </div>
  );
}
