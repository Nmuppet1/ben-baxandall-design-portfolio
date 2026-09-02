import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

/**
 * Drop your own artwork in here: keep the outer <svg> with its viewBox and
 * make sure the drawing is made of strokes (no fills), ideally a single
 * continuous path so the line reads as one unbroken stroke.
 * Any interest without an entry falls back to the generic squiggle.
 */
export const DOODLES: Record<string, React.ReactNode> = {
  // "Guitar": <svg viewBox="0 0 200 100">…your path…</svg>,
};

function FallbackDoodle() {
  return (
    <svg viewBox="0 0 220 80" fill="none">
      <path
        d="M4 62 C 30 62, 34 14, 58 14 S 88 62, 112 62 S 146 14, 170 14 S 204 48, 216 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Draws the doodle next to an interest as one continuous line, on click. */
export default function InterestDoodle({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const targets = "path, circle, polyline, line, rect, ellipse";
      gsap
        .timeline({ defaults: { duration: 1.6, ease: "power1.inOut" } })
        .set(el, { opacity: 1 })
        .from(targets, { drawSVG: "0% 0%" })
        .to(targets, { drawSVG: "100% 100%" });
    }, el);
    return () => ctx.revert();
  }, [name]);

  return (
    <div ref={ref} className="interest-doodle w-40 text-warm opacity-0" aria-hidden>
      {DOODLES[name] ?? <FallbackDoodle />}
    </div>
  );
}
