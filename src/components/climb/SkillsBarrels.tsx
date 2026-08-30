import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./SkillsBarrels.css";

const SKILLS: Record<string, string[]> = {
  Engineering: [
    "Fusion",
    "SolidWorks",
    "Laser Cutting",
    "CNC Routing",
    "Project Management",
    "Stakeholder Feedback Analysis",
    "Iterative Design",
    "UCD",
  ],
  Electronics: [
    "Arduino",
    "Raspberry Pi",
    "Soldering",
    "Motor Driving",
    "Sensor Integration",
    "LT Spice",
    "FPGA Development",
  ],
  Programming: ["C++", "C#", "GitHub", "OpenCV", "Python", "Verilog", "MATLAB", "React"],
  Creative: ["Blender", "Filmora", "Canva", "3D Printing", "Cura Slicer", "UI / UX"],
};

const ITEM_HEIGHT = 42; // vertical spacing between items, px
const VISIBLE_RANGE = 3; // items shown on each side of the front one
const DRAG_PX_PER_STEP = 50; // px of drag needed to move one item
const AUTO_SCROLL_SPEED = 0.18; // items per second when idle
const RESUME_DELAY_MS = 650; // pause auto-scroll this long after a release, so the snap settles first

// Shortest signed distance from `raw` to 0 on a circular list of length n
function wrapOffset(raw: number, n: number) {
  return (((raw + n / 2) % n) + n) % n - n / 2;
}

function Barrel({ title, items }: { title: string; items: string[] }) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0); // continuous position, in "items"
  const dragState = useRef({ dragging: false, startY: 0, startIndex: 0 });
  const resumeAtRef = useRef(0); // performance.now() timestamp — auto-scroll stays paused until then
  const [frontIndex, setFrontIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const n = items.length;

  const layout = (index: number, animate: boolean) => {
    items.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const offset = wrapOffset(i - index, n);
      const abs = Math.abs(offset);
      const inRange = abs <= VISIBLE_RANGE;

      // The front 3 items (offset -1, 0, 1) stay near-flat and fully visible;
      // beyond that it fades and tilts away faster, same idea as before.
      const isFront = abs <= 1;
      const vars = {
        y: offset * ITEM_HEIGHT,
        rotationX: isFront ? offset * -4 : offset * -14,
        scale: isFront ? 1 : Math.max(0.6, 1 - (abs - 1) * 0.15),
        opacity: !inRange ? 0 : isFront ? 1 : Math.max(0, 1 - (abs - 1) * 0.4),
      };
      if (animate) {
        gsap.to(el, { ...vars, duration: 0.6, ease: "elastic.out(1, 0.65)" });
      } else {
        gsap.set(el, vars);
      }
    });
  };

  // Lay everything out once, before first paint
  useLayoutEffect(() => {
    indexRef.current = 0;
    layout(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Auto-scroll whenever the barrel isn't being dragged (and isn't still
  // settling from a recent release)
  useEffect(() => {
    let raf: number;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!dragState.current.dragging && now >= resumeAtRef.current) {
        indexRef.current += AUTO_SCROLL_SPEED * dt;
        layout(indexRef.current, false);

        const rounded = Math.round(indexRef.current);
        const wrapped = ((rounded % n) + n) % n;
        setFrontIndex((prev) => (prev !== wrapped ? wrapped : prev));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { dragging: true, startY: e.clientY, startIndex: indexRef.current };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const deltaY = e.clientY - dragState.current.startY;
    const newIndex = dragState.current.startIndex - deltaY / DRAG_PX_PER_STEP;
    indexRef.current = newIndex;
    layout(newIndex, false);
  };

  const onPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    setIsDragging(false);

    const snapped = Math.round(indexRef.current);
    indexRef.current = snapped;
    layout(snapped, true);
    setFrontIndex(((snapped % n) + n) % n);

    // hold off auto-scroll until the elastic snap has settled
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
  };

  return (
    <div className="skill-barrel">
      <h3>{title}</h3>

      <div
        className="barrel-window"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <div className="barrel">
          {items.map((skill, i) => (
            <div
              key={skill}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`skill ${i === frontIndex ? "skill-active" : ""}`}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      <p className="barrel-hint">drag to cycle</p>
    </div>
  );
}

export default function SkillsBarrels() {
  return (
    <div className="skills-barrels">
      {Object.entries(SKILLS).map(([title, items]) => (
        <Barrel key={title} title={title} items={items} />
      ))}
    </div>
  );
}