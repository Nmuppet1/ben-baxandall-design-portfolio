import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const GRADES = ["V0", "V1", "V2", "V3", "V4"];
const SUMMIT_THRESHOLD = 0.995; // treat "essentially at the top" as the summit
const LEVELS = [...GRADES, "Summit"] as const;

export default function MountainProgress({ progress }: { progress: number }) {
  const gradeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const safeProgress = Math.min(1, Math.max(0, progress));
  const summitReached = safeProgress >= SUMMIT_THRESHOLD;

  // 0..4 while climbing normally; only jumps to the Summit index (5) once
  // the threshold is crossed, so it doesn't share the proportional split
  // with the numbered grades
  const activeIndex = summitReached
    ? LEVELS.length - 1
    : Math.min(GRADES.length - 1, Math.floor(safeProgress * GRADES.length));

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gradeRefs.current.forEach((el, index) => {
      if (!el) return;
      const reached = index <= activeIndex;
      gsap.to(el, {
        autoAlpha: reached ? 1 : 0,
        y: reached ? 0 : 10,
        scale: reached ? 1 : 0.88,
        duration: reducedMotion ? 0 : 0.45,
        delay: reducedMotion || !reached ? 0 : index === activeIndex ? 0.08 : 0,
        ease: "back.out(1.8)",
        overwrite: true,
      });
    });
  }, [activeIndex]);

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-6 z-40 flex flex-col-reverse items-start gap-1"
      role="img"
      aria-label={summitReached ? "Summit reached" : `Climbing grade ${GRADES[activeIndex]}`}
    >
      {LEVELS.map((level, index) => {
        const isActive = index === activeIndex;
        const isSummit = level === "Summit";

        return (
          <div
            key={level}
            ref={(element) => {
              gradeRefs.current[index] = element;
            }}
            className={`flex h-7 items-center gap-2 text-[0.65rem] tracking-[0.25em] ${
              isActive ? "text-warm" : "text-muted-foreground/55"
            }`}
          >
            <span
              className={`block h-px bg-warm ${
                isActive ? (isSummit ? "w-10" : "w-7") : "w-4 bg-border"
              }`}
            />
            <span className={`flex items-center gap-1.5 ${isSummit ? "font-medium" : ""}`}>
              {isSummit && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <polygon points="5,0 10,10 0,10" />
                </svg>
              )}
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}