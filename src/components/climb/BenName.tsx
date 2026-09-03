import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./BenName.css";

// Drop your own images in /public and point these at them —
// one per letter, shown while the mouse is over that letter.
const LETTERS: { char: string; image: string }[] = [
  { char: "B", image: "/ben/bi.png" },
  { char: "E", image: "/ben/ei.png" },
  { char: "N", image: "/ben/ni.png" },
];

export default function BenName() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ben-letter", {
        yPercent: 120,
        opacity: 0,
        rotateX: -60,
        duration: 1.1,
        stagger: 0.12,
        ease: "power4.out",
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const setState = (el: HTMLElement, hovered: boolean) => {
    const img = el.querySelector(".ben-image");
    const glyph = el.querySelector(".ben-glyph");
    // overwrite kills any in-flight tween on the same target, so a fast
    // enter/leave can never leave an image stuck visible
    gsap.to(glyph, {
      opacity: hovered ? 0 : 1,
      scale: hovered ? 0.9 : 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(img, {
      opacity: hovered ? 1 : 0,
      scale: hovered ? 1 : 1.15,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(el, {
      y: hovered ? -14 : 0,
      duration: hovered ? 0.5 : 0.6,
      ease: hovered ? "power3.out" : "elastic.out(1, 0.6)",
      overwrite: "auto",
    });
  };

  // Safety net: whatever happens (fast swipes, pointercancel, window blur),
  // reset every letter when the pointer leaves the whole name.
  const resetAll = () => {
    rootRef.current?.querySelectorAll<HTMLElement>(".ben-letter").forEach((el) => setState(el, false));
  };

  useLayoutEffect(() => {
    window.addEventListener("blur", resetAll);
    return () => window.removeEventListener("blur", resetAll);
  }, []);

  return (
    <div
      className="ben-name"
      ref={rootRef}
      aria-label="Ben"
      onPointerLeave={resetAll}
      onPointerCancel={resetAll}
    >
      {LETTERS.map(({ char, image }) => (
        <span
          key={char}
          className="ben-letter"
          onPointerEnter={(e) => setState(e.currentTarget, true)}
          onPointerLeave={(e) => setState(e.currentTarget, false)}
          onPointerCancel={(e) => setState(e.currentTarget, false)}
        >
          <span className="ben-glyph" aria-hidden>
            {char}
          </span>
          <span className="ben-image" style={{ backgroundImage: `url(${image})` }} aria-hidden />
        </span>
      ))}
    </div>
  );
}
