import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export type Puff = {
  id: number;
  left: string;
  bottom: number;
  seed: number;
};

const PARTICLES = 22;

/** A burst of chalk dust that blooms right on the hold that was grabbed. */
export function ChalkPuff({ puff }: { puff: Puff }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".chalk-cloud",
        { scale: 0.3, opacity: 0.85 },
        {
          scale: 2.1,
          opacity: 0,
          duration: 1.25,
          ease: "power2.out",
          stagger: 0.06,
        },
        0,
      );

      gsap.utils.toArray<HTMLElement>(".chalk-dot").forEach((dot, i) => {
        const ang = (i / PARTICLES) * Math.PI * 2 + puff.seed;
        const dist = 18 + Math.random() * 55;
        tl.fromTo(
          dot,
          { x: 0, y: 0, scale: 1, opacity: 0.9 },
          {
            x: Math.cos(ang) * dist,
            y: Math.sin(ang) * dist * 0.7 - 14 - Math.random() * 18,
            scale: 0.2,
            opacity: 0,
            duration: 0.9 + Math.random() * 0.7,
            ease: "power2.out",
          },
          0.02 * i * 0.5,
        );
      });
    }, el);

    return () => ctx.revert();
  }, [puff.seed]);

  return (
    <div
      ref={root}
      className="pointer-events-none absolute z-30"
      style={{ left: puff.left, bottom: puff.bottom, width: 0, height: 0 }}
      aria-hidden
    >
      <div className="absolute -translate-x-1/2 translate-y-1/2">
        <div className="chalk-cloud absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chalk/30 blur-lg" />
        <div className="chalk-cloud absolute h-8 w-8 -translate-x-1/4 -translate-y-1/3 rounded-full bg-chalk/25 blur-md" />
        <div className="chalk-cloud absolute h-6 w-6 -translate-x-3/4 -translate-y-1/4 rounded-full bg-chalk/25 blur-md" />

        {Array.from({ length: PARTICLES }, (_, i) => (
          <span
            key={i}
            className="chalk-dot absolute block -translate-x-1/2 -translate-y-1/2 rounded-full bg-chalk"
            style={{ width: 2 + Math.random() * 4, height: 2 + Math.random() * 4 }}
          />
        ))}
      </div>
    </div>
  );
}
