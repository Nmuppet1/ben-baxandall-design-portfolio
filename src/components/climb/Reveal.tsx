import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Fades + lifts its children into place the first time they come into
 * view. The page has no scrollbar, so this watches the element itself
 * rather than a scroll position.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { autoAlpha: 0, y: 48 });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          gsap.to(el, { autoAlpha: 1, y: 0, duration: 1, delay, ease: "power3.out" });
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
