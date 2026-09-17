import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export default function MountainProgress({ progress }: { progress: number }) {
  const routeRef = useRef<SVGPathElement>(null);
  const safeProgress = Math.min(1, Math.max(0, progress));

  useLayoutEffect(() => {
    const route = routeRef.current;
    if (!route) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(route, {
      strokeDashoffset: 1 - safeProgress,
      duration: reducedMotion ? 0 : 0.45,
      ease: "power2.out",
      overwrite: true,
    });
  }, [safeProgress]);

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-40 flex items-end gap-3 text-muted-foreground">
      <svg
        className="h-32 w-14 overflow-visible"
        viewBox="0 0 56 128"
        role="img"
        aria-label={`${Math.round(safeProgress * 100)} percent climbed`}
      >
        <path
          d="M9 120 L34 101 L17 88 L44 68 L23 52 L47 31 L34 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
        />
        <path
          ref={routeRef}
          d="M9 120 L34 101 L17 88 L44 68 L23 52 L47 31 L34 14"
          fill="none"
          stroke="var(--warm)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
        />
      </svg>
      <span className="mb-0.5 text-[0.65rem] tracking-[0.25em] text-warm">
        {Math.round(safeProgress * 100)}%
      </span>
    </div>
  );
}
