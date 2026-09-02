import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

// One entry per clickable trigger. Paste your exported Canva SVG markup
// straight in as `svg` — keep the outer <svg> tag and its viewBox.
type DrawItem = {
  id: string;
  label: string;
  svg: React.ReactNode;
};

const ITEMS: DrawItem[] = [
  {
    id: "one",
    label: "Skills",
    svg: (
      
  },
  // add more items here, one per SVG
];

export default function DrawOnClick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Hide every path in every SVG on mount, ready to be drawn in on demand
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const allPaths = containerRef.current.querySelectorAll(".draw-target path, .draw-target circle, .draw-target polyline");
    gsap.set(allPaths, { drawSVG: "0%" });
  }, []);

  const reveal = (id: string) => {
    setActiveId(id);
    if (!containerRef.current) return;
    const target = containerRef.current.querySelector(`[data-item="${id}"] path, [data-item="${id}"] circle, [data-item="${id}"] polyline`);
    const allInThatSvg = containerRef.current.querySelectorAll(`[data-item="${id}"] path, [data-item="${id}"] circle, [data-item="${id}"] polyline`);

    gsap.fromTo(
      allInThatSvg,
      { drawSVG: "0%" },
      { drawSVG: "100%", duration: 1.2, ease: "power2.inOut", stagger: 0.15 }
    );
  };

  return (
    <div ref={containerRef}>
      <div className="draw-triggers">
        {ITEMS.map((item) => (
          <button key={item.id} onClick={() => reveal(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {ITEMS.map((item) => (
        <div
          key={item.id}
          className="draw-target"
          data-item={item.id}
          style={{ display: activeId === item.id ? "block" : "none" }}
        >
          {item.svg}
        </div>
      ))}
    </div>
  );
}