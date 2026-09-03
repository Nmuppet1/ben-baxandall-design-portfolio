import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project } from "./ProjectGallery";
import "./ProjectStory.css";

const FRICTION = 0.65; // same resistance feel as the wall climb

export default function ProjectStory({ project }: { project: Project }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startY: 0, startPull: 0 });
  const [maxPull, setMaxPull] = useState(0);
  const [pull, setPull] = useState(0); // 0 = only the description peeking; grows as you pull up

  // Measure available pull distance — remeasure as images (and gifs) load.
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const measure = () =>
      setMaxPull(Math.max(content.scrollHeight - viewport.clientHeight, 0));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [project.id]);

  useLayoutEffect(() => {
    setPull(0);
  }, [project.id]);

  useLayoutEffect(() => {
    gsap.to(contentRef.current, {
      y: -(maxPull - Math.min(pull, maxPull)),
      duration: dragState.current.dragging ? 0.12 : 0.6,
      ease: "power3.out",
      overwrite: true,
    });
  }, [pull, maxPull]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { dragging: true, startY: e.clientY, startPull: pull };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const deltaY = dragState.current.startY - e.clientY; // dragging UP is positive
    const next = gsap.utils.clamp(0, maxPull, dragState.current.startPull + deltaY * FRICTION);
    setPull(next);
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  const atTop = maxPull === 0 || pull >= maxPull - 2;
  const progress = maxPull ? Math.min(pull / maxPull, 1) : 0;

  return (
    <div className="project-story">
      <div
        className="story-grip"
        role="button"
        tabIndex={0}
        aria-label={`Pull up to explore ${project.title}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => setPull(atTop ? 0 : maxPull)}
      >
        <span className="story-grip-bar" />
        <span className="story-grip-label">
          {atTop ? "release — drop back down" : `pull up to explore "${project.title}"`}
        </span>
        <span className="story-grip-progress" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="story-viewport" ref={viewportRef}>
        <div className="story-content" ref={contentRef}>
          {/* column-reverse below means this first item sits at the bottom,
              visible at rest — photos stack above it as you pull up */}
          <div className="story-card story-description">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
          {project.images.map((src) => (
            <div className="story-card story-image" key={src}>
              <img src={src} alt={project.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
