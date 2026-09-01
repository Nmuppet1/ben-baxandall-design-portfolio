import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./BenName.css";

// Drop your own images in /public and point these at them —
// one per letter, shown while the mouse is over that letter.
const LETTERS: { char: string; image: string }[] = [
  { char: "B", image: "/elec/PID.png" },
  { char: "E", image: "/BEN/Copy of Ben Baxandall- Portfolio (7).png" },
  { char: "N", image: "/BEN/Copy of Ben Baxandall- Portfolio (8).png" },
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

  const enter = (el: HTMLElement) => {
    const img = el.querySelector(".ben-image");
    const glyph = el.querySelector(".ben-glyph");
    gsap.to(glyph, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.out" });
    gsap.to(img, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
    gsap.to(el, { y: -14, duration: 0.5, ease: "power3.out" });
  };

  const leave = (el: HTMLElement) => {
    const img = el.querySelector(".ben-image");
    const glyph = el.querySelector(".ben-glyph");
    gsap.to(img, { opacity: 0, scale: 1.15, duration: 0.4, ease: "power2.inOut" });
    gsap.to(glyph, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    gsap.to(el, { y: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" });
  };

  return (
    <div className="ben-name" ref={rootRef} aria-label="Ben">
      {LETTERS.map(({ char, image }) => (
        <span
          key={char}
          className="ben-letter"
          onPointerEnter={(e) => enter(e.currentTarget)}
          onPointerLeave={(e) => leave(e.currentTarget)}
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
