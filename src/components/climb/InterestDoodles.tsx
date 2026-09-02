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
  /* "Guitar": <svg viewBox="0 0 200 100">…your path…</svg>,
  "Raspberry Pi":,
  "Animation":,
  "3D Printing":,
  "Wild Swimming":,
  "Football":,
  "Running":,
  "Cooking":,
  "Guitar":,
  "Reading":,
  */
 "Guitar": <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1920" zoomAndPan="magnify" viewBox="0 0 1440 809.999993" height="1080" preserveAspectRatio="xMidYMid meet" version="1.0"><path stroke-linecap="butt" transform="matrix(0.166367, -0.731315, 0.731315, 0.166367, 303.424942, 511.26381)" fill="none" stroke-linejoin="miter" d="M -0.00169714 1.999219 L 378.773262 1.998971 " stroke="#000000" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.747127, 0.065586, -0.065586, 0.747127, 336.528856, 371.604143)" fill="none" stroke-linejoin="miter" d="M 0.000914938 1.998929 L 118.637735 1.999377 " stroke="#000000" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.166367, -0.731315, 0.731315, 0.166367, 392.062429, 519.044754)" fill="none" stroke-linejoin="miter" d="M -0.00232262 1.998311 L 378.772636 1.998063 " stroke="#000000" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.737093, 0.138542, -0.138542, 0.737093, 450.130952, 332.853987)" fill="none" stroke-linejoin="miter" d="M 0.00208668 1.999542 L 378.775857 2.000124 " stroke="#000000" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(-0.0372341, 0.749075, -0.749075, -0.0372341, 590.942736, 360.644944)" fill="none" stroke-linejoin="miter" d="M -0.00026591 1.999044 L 118.635652 1.999936 " stroke="#000000" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.737093, 0.138542, -0.138542, 0.737093, 445.713584, 421.722599)" fill="none" stroke-linejoin="miter" d="M 0.000948443 1.997824 L 378.774719 1.998406 " stroke="#000000" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/></svg>
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
