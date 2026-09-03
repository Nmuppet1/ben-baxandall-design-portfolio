import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project } from "./ProjectGallery";
import "./ProjectStory.css";

const FRICTION = 0.9; // resistance while hauling the story upward

export default function ProjectStory({ project }: { project: Project }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startY: 0, startPull: 0, moved: false });
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
    const imgs = Array.from(content.querySelectorAll("img"));
    imgs.forEach((img) => img.addEventListener("load", measure));
    return () => {
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [project.id]);

  useLayoutEffect(() => {
    setPull(0);
  }, [project.id]);

  useLayoutEffect(() => {
    // content is bottom-aligned; pulling up translates it DOWN to reveal
    // the images stacked above the description
    gsap.to(contentRef.current, {
      y: Math.min(pull, maxPull),
      duration: dragState.current.dragging ? 0.1 : 0.6,
      ease: "power3.out",
      overwrite: true,
    });
  }, [pull, maxPull]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { dragging: true, startY: e.clientY, startPull: pull, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const deltaY = dragState.current.startY - e.clientY; // dragging UP is positive
    if (Math.abs(deltaY) > 3) dragState.current.moved = true;
    const next = gsap.utils.clamp(0, maxPull, dragState.current.startPull + deltaY * FRICTION);
    setPull(next);
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  const progress = maxPull ? Math.min(pull / maxPull, 1) : 0;
  const atTop = maxPull === 0 || progress > 0.98;

  return (
    <div className="project-story">
      <div
        className="story-viewport"
        ref={viewportRef}
        role="button"
        tabIndex={0}
        aria-label={`Drag upward to read more about ${project.title}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="story-content" ref={contentRef}>
          {/* column-reverse below means this first item sits at the bottom,
              visible at rest — photos stack above it as you pull up */}
          <div className="story-card story-description">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
          {project.images.map((src) => (
            <div className="story-card story-image" key={src}>
              <img src={src} alt={project.title} draggable={false} />
            </div>
          ))}
        </div>

        {!atTop && (
          <span className="story-hint">drag the images up to read on</span>
        )}
        <span className="story-progress" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
