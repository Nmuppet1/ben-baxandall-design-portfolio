import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./ProjectGallery.css";

export type Project = {
  id: string;
  title: string;
  thumb: string; // square image
  description: string;
  images: string[]; // full story photos, natural aspect ratio
};

// Swap in your real projects (drop images in /public and reference them as "/elec/PID.png")
export const PROJECTS: Project[] = [
  { id: "p1", title: "Project One", thumb: "/elec/PID.png", description: "Description of project one.", images: ["/elec/PID.png"] },
  { id: "p2", title: "Project Two", thumb: "/elec/PID.png", description: "Description of project two.", images: ["/elec/PID.png"] },
  { id: "p3", title: "Project Three", thumb: "/elec/PID.png", description: "Description of project three.", images: ["/elec/PID.png"] },
  { id: "p4", title: "Project Four", thumb: "/elec/PID.png", description: "Description of project four.", images: ["/elec/PID.png"] },
  { id: "p5", title: "Project Five", thumb: "/elec/PID.png", description: "Description of project five.", images: ["/elec/PID.png"] },
  { id: "p6", title: "Project Six", thumb: "/elec/PID.png", description: "Description of project six.", images: ["/elec/PID.png"] },
];

const RADIUS = 100; // px from the ring centre to each card
const AUTO_SPEED = 4; // degrees per second while idle
const DRAG_DEG_PER_PX = 0.25;
const RESUME_DELAY_MS = 1200;

/**
 * A true 3D infinite carousel: cards sit on the surface of a cylinder and
 * the whole ring is rotated with GSAP. Because it is a ring, spinning it
 * forever in either direction never runs out of cards.
 */
export default function ProjectGallery({
  onSelect,
  autoSpinPaused = false,
}: {
  onSelect: (project: Project) => void;
  /** Pass true while something else (e.g. the story panel below) is being dragged,
   *  so the ring doesn't keep reassigning the active project mid-gesture. */
  autoSpinPaused?: boolean;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotation = useRef(0); // degrees, grows/shrinks without limit
  const drag = useRef({ active: false, startX: 0, startRot: 0 });
  const resumeAt = useRef(0);
  const lastIndex = useRef(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  const n = PROJECTS.length;
  const step = 360 / n;

  const render = () => {
    const ring = ringRef.current;
    if (!ring) return;
    gsap.set(ring, { rotationY: rotation.current });

    // Fade/dim the cards facing away so the ring reads as depth, not clutter.
    // This must use the SAME angle formula as each card's own base rotation
    // below, or the "front" the math thinks it sees won't match what's
    // actually rendered facing the camera.
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const angle = ((i * step + rotation.current) % 360 + 360) % 360;
      const facing = Math.cos((angle * Math.PI) / 180); // 1 = front, -1 = back
      gsap.set(el, {
        opacity: gsap.utils.clamp(0.12, 1, 0.2 + facing * 0.9),
        filter: `brightness(${gsap.utils.clamp(0.4, 1.1, 0.55 + facing * 0.55)})`,
      });
    });

    const idx = gsap.utils.wrap(0, n, Math.round(-rotation.current / step));
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      setActiveIndex(idx);
      onSelect(PROJECTS[idx]!);
    }
  };

  useLayoutEffect(() => {
    cardRefs.current.forEach((el, i) => {
      // FIX: was `-i * step`, which put each card at the opposite angle from
      // what the opacity/index math above assumes. Now both agree.
      if (el) gsap.set(el, { rotationY: i * step, z: RADIUS, transformOrigin: `50% 50% ${-RADIUS}px` });
    });
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle auto-spin — now also respects the externally-controlled pause
  useEffect(() => {
    const tick = () => {
      if (!drag.current.active && !autoSpinPaused && performance.now() >= resumeAt.current) {
        rotation.current -= (AUTO_SPEED * (gsap.ticker.deltaRatio() * 1)) / 60;
        render();
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpinPaused]);

  const snap = () => {
    const target = Math.round(rotation.current / step) * step;
    gsap.to(rotation, {
      current: target,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: render,
      onComplete: render,
    });
    resumeAt.current = performance.now() + RESUME_DELAY_MS;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    gsap.killTweensOf(rotation);
    drag.current = { active: true, startX: e.clientX, startRot: rotation.current };
    setGrabbing(true);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    rotation.current = drag.current.startRot + (e.clientX - drag.current.startX) * DRAG_DEG_PER_PX;
    render();
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setGrabbing(false);
    snap();
  };

  const goTo = (i: number) => {
    gsap.killTweensOf(rotation);
    const current = rotation.current;
    const target = -i * step;
    // take the shortest way round the ring
    const delta = ((target - current + 180) % 360 + 360) % 360 - 180;
    gsap.to(rotation, {
      current: current + delta,
      duration: 1,
      ease: "power3.inOut",
      onUpdate: render,
      onComplete: render,
    });
    resumeAt.current = performance.now() + RESUME_DELAY_MS;
  };

  return (
    <div className="carousel">
      <div
        className="carousel-stage"
        style={{ cursor: grabbing ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="carousel-ring" ref={ringRef}>
          {PROJECTS.map((project, i) => (
            <div
              key={project.id}
              className={`carousel-card ${i === activeIndex ? "is-active" : ""}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => goTo(i)}
            >
              <img src={project.thumb} alt={project.title} loading="lazy" />
              <span className="carousel-card-title">{project.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-dots">
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            aria-label={`Show ${p.title}`}
            className={i === activeIndex ? "is-active" : ""}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      <p className="carousel-hint">drag to spin</p>
    </div>
  );
}