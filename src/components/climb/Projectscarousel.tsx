import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import "./ProjectsCarousel.css";

gsap.registerPlugin(Draggable);

type Project = {
  id: string;
  title: string;
  thumb: string;
  images: string[];
  description: string;
};

// Swap in your real projects/images/copy
const PROJECTS: Project[] = [
  { id: "p1", title: "Project One", thumb: "/images/project1-thumb.jpg", images: ["/images/project1-1.jpg", "/images/project1-2.jpg"], description: "Description of project one." },
  { id: "p2", title: "Project Two", thumb: "/images/project2-thumb.jpg", images: ["/images/project2-1.jpg"], description: "Description of project two." },
  { id: "p3", title: "Project Three", thumb: "/images/project3-thumb.jpg", images: ["/images/project3-1.jpg"], description: "Description of project three." },
  { id: "p4", title: "Project Four", thumb: "/images/project4-thumb.jpg", images: ["/images/project4-1.jpg"], description: "Description of project four." },
];

const CARD_WIDTH = 320; // px, include your own gap in this number

export default function ProjectsCarousel({ progress = 1 }: { progress?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selected, setSelected] = useState(0);
  const [padding, setPadding] = useState(0);
  const totalWidth = CARD_WIDTH * PROJECTS.length;

  // Center the first card by padding the track — recalculated on resize
  useLayoutEffect(() => {
    const recalc = () => {
      if (!containerRef.current) return;
      setPadding((containerRef.current.clientWidth - CARD_WIDTH) / 2);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const updateSelected = () => {
      const centerX = container.getBoundingClientRect().left + container.clientWidth / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i % PROJECTS.length;
        }
      });
      setSelected(closestIndex);
    };

    // Don't destructure/index the returned array — just loop over it on cleanup.
    const instances = Draggable.create(track, {
      type: "x",
      inertia: true,
      modifiers: { x: gsap.utils.wrap(-totalWidth, 0) },
      snap: { x: (value: number) => Math.round(value / CARD_WIDTH) * CARD_WIDTH },
      onDrag: updateSelected,
      onThrowUpdate: updateSelected,
      onRelease: updateSelected,
    });

    updateSelected();

    return () => {
      instances.forEach((d) => d.kill());
    };
  }, [padding, totalWidth]);

  // Guaranteed non-empty PROJECTS, so this always resolves to a real Project
  const selectedProject = PROJECTS[selected] ?? PROJECTS[0]!;

  return (
    <div
      className="projects-carousel"
      style={{ opacity: progress, transform: `translateY(${(1 - progress) * 24}px)` }}
    >
      <div className="carousel-viewport" ref={containerRef}>
        <div className="carousel-track" ref={trackRef} style={{ paddingLeft: padding }}>
          {[...PROJECTS, ...PROJECTS].map((project, i) => (
            <div
              key={`${project.id}-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`project-card ${i % PROJECTS.length === selected ? "project-card-active" : ""}`}
              style={{ width: CARD_WIDTH }}
            >
              <img src={project.thumb} alt={project.title} />
              <h3>{project.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <ProjectDetailPull project={selectedProject} />
    </div>
  );
}

function ProjectDetailPull({ project }: { project: Project }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startY: 0 });
  const [open, setOpen] = useState(false);

  const FRICTION = 0.5; // same idea as the wall climb — resistance, not a free drag
  const OPEN_THRESHOLD = 120; // px of (frictioned) pull before it snaps fully open
  const MAX_PULL = 400;

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { dragging: true, startY: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const deltaY = Math.max(0, e.clientY - dragState.current.startY);
    gsap.set(panelRef.current, { y: Math.min(deltaY * FRICTION, MAX_PULL) });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const pulled = Math.max(0, e.clientY - dragState.current.startY) * FRICTION;

    if (pulled > OPEN_THRESHOLD) {
      gsap.to(panelRef.current, { y: MAX_PULL, duration: 0.5, ease: "power2.out" });
      setOpen(true);
    } else {
      gsap.to(panelRef.current, { y: 0, duration: 0.4, ease: "power2.inOut" });
      setOpen(false);
    }
  };

  const close = () => {
    gsap.to(panelRef.current, { y: 0, duration: 0.4, ease: "power2.inOut" });
    setOpen(false);
  };

  // reset the pull whenever a different project becomes centered
  useLayoutEffect(() => {
    gsap.set(panelRef.current, { y: 0 });
    setOpen(false);
  }, [project.id]);

  return (
    <div className="project-detail-pull">
      <button
        className="pull-tab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label={`Pull down for more on ${project.title}`}
      >
        ↓ pull for more
      </button>

      <div className="pull-panel" ref={panelRef}>
        {open && (
          <button className="pull-close" onClick={close} aria-label="Close">
            ×
          </button>
        )}
        <div className="pull-images">
          {project.images.map((src) => (
            <img key={src} src={src} alt={project.title} />
          ))}
        </div>
        <p>{project.description}</p>
      </div>
    </div>
  );
}