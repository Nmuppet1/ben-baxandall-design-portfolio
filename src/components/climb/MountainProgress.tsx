import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const GRADES = ["V0", "V1", "V2", "V3", "V4"];
const SUMMIT_THRESHOLD = 0.995; // treat "essentially at the top" as the summit

export default function MountainProgress({ progress }: { progress: number }) {
  const gradeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const safeProgress = Math.min(1, Math.max(0, progress));
  const summitReached = safeProgress >= SUMMIT_THRESHOLD;
  const activeGrade = Math.min(GRADES.length - 1, Math.floor(safeProgress * GRADES.length));

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gradeRefs.current.forEach((grade, index) => {
      if (!grade) return;
      const reached = index <= activeGrade;
      gsap.to(grade, {
        autoAlpha: reached ? 1 : 0,
        y: reached ? 0 : 10,
        scale: reached ? 1 : 0.88,
        duration: reducedMotion ? 0 : 0.45,
        delay: reducedMotion || !reached ? 0 : index === activeGrade ? 0.08 : 0,
        ease: "back.out(1.8)",
        overwrite: true,
      });
    });
  }, [activeGrade]);

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-6 z-40 flex flex-col-reverse items-start gap-1"
      role="img"
      aria-label={summitReached ? "Summit reached" : `Climbing grade ${GRADES[activeGrade]}`}
    >
      {GRADES.map((grade, index) => {
        const isActive = index === activeGrade;
        // Only the top grade (V4), once you're basically at the top, swaps
        // its own label to "Summit" instead of a separate item appearing
        const isSummitLabel = isActive && index === GRADES.length - 1 && summitReached;
        const label = isSummitLabel ? "Summit" : grade;

        return (
          <div
            key={grade}
            ref={(element) => {
              gradeRefs.current[index] = element;
            }}
            className={`flex h-7 items-center gap-2 text-[0.65rem] tracking-[0.25em] ${
              isActive ? "text-warm" : "text-muted-foreground/55"
            }`}
          >
            <span
              className={`block h-px bg-warm ${
                isActive ? (isSummitLabel ? "w-10" : "w-7") : "w-4 bg-border"
              }`}
            />
            <span className={isSummitLabel ? "font-medium" : undefined}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}