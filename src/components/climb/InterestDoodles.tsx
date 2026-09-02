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
 "Guitar": <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1920" zoomAndPan="magnify" viewBox="0 0 1440 809.999993" height="1080" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="f8117bfb06"><path d="M 365.375 374.585938 L 402.125 374.585938 L 402.125 411.335938 L 365.375 411.335938 Z M 365.375 374.585938 " clip-rule="nonzero"/></clipPath><clipPath id="75b16879ad"><path d="M 383.773438 374.585938 C 373.613281 374.585938 365.375 382.824219 365.375 392.984375 C 365.375 403.144531 373.613281 411.382812 383.773438 411.382812 C 393.9375 411.382812 402.171875 403.144531 402.171875 392.984375 C 402.171875 382.824219 393.9375 374.585938 383.773438 374.585938 Z M 383.773438 374.585938 " clip-rule="nonzero"/></clipPath></defs><path stroke-linecap="butt" transform="matrix(-0.014044, -0.749868, 0.749868, -0.014044, 381.169293, 429.178486)" fill="none" stroke-linejoin="miter" d="M -0.0025668 1.998537 L 331.050263 1.999688 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0, -0.75, 0.75, 0, 390.05565, 450.509685)" fill="none" stroke-linejoin="miter" d="M 0.00249711 1.998717 L 279.398345 1.998717 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(-0.375, -0.649519, 0.649519, -0.375, 400.87897, 223.502704)" fill="none" stroke-linejoin="miter" d="M -0.00250788 2.001138 L 64.425779 2.001831 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.377918, -0.647826, 0.647826, 0.377918, 390.261872, 240.208719)" fill="none" stroke-linejoin="miter" d="M 0.000387015 2.001427 L 28.109568 1.998534 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.13313, -0.73809, 0.73809, 0.13313, 333.338574, 395.674541)" fill="none" stroke-linejoin="miter" d="M 1.21346 22.376011 C 36.884248 -4.793495 62.186784 -4.795302 77.116865 22.376639 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0, -0.75, 0.75, 0, 326.338027, 480.884444)" fill="none" stroke-linejoin="miter" d="M 1.470925 31.575341 C 37.924052 -7.856953 74.382387 -7.856953 110.840722 31.575341 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(-0.658555, 0.358895, -0.358895, -0.658555, 461.968759, 461.326101)" fill="none" stroke-linejoin="miter" d="M 1.753127 49.810502 C 36.612531 -13.937161 83.64355 -13.936736 142.853249 49.809698 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.220571, 0.716832, -0.716832, 0.220571, 427.046625, 372.8492)" fill="none" stroke-linejoin="miter" d="M 1.86104 1.825641 C 9.493694 21.170663 34.869704 21.17549 77.977199 1.825569 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(-0.75, 0, 0, -0.75, 415.943169, 364.352901)" fill="none" stroke-linejoin="miter" d="M 0.919017 11.251785 C 24.830477 -1.086757 35.366936 -1.086757 32.517977 11.251785 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><path stroke-linecap="butt" transform="matrix(0.377903, 0.647834, -0.647834, 0.377903, 422.172849, 351.021857)" fill="none" stroke-linejoin="miter" d="M 0.986039 11.255304 C 22.800581 -1.085038 32.405248 -1.083913 29.809787 11.252305 " stroke="#fc9f30" stroke-width="4" stroke-opacity="1" stroke-miterlimit="4"/><g clip-path="url(#f8117bfb06)"><g clip-path="url(#75b16879ad)"><path stroke-linecap="butt" transform="matrix(0.75, 0, 0, 0.75, 365.376842, 374.586856)" fill="none" stroke-linejoin="miter" d="M 24.528795 -0.00122407 C 10.981919 -0.00122407 -0.00245632 10.983151 -0.00245632 24.530027 C -0.00245632 38.076903 10.981919 49.061278 24.528795 49.061278 C 38.080879 49.061278 49.060046 38.076903 49.060046 24.530027 C 49.060046 10.983151 38.080879 -0.00122407 24.528795 -0.00122407 Z M 24.528795 -0.00122407 " stroke="#fc9f30" stroke-width="8" stroke-opacity="1" stroke-miterlimit="4"/></g></g></svg>
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
