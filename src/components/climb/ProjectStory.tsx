import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project } from "./ProjectGallery";
import "./ProjectStory.css";

const FRICTION = 0.5; // same resistance feel as the wall climb

export default function ProjectStory({ project }: { project: Project }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startY: 0, startPull: 0 });
  const maxPullRef = useRef(0);
  const [pull, setPull] = useState(0); // 0 = only the description peeking; grows as you pull up

  // Recalculate available pull distance, and reset to collapsed, whenever
  // the active project changes.
  useLayoutEffect(() => {
    if (!viewportRef.current || !contentRef.current) return;
    maxPullRef.current = Math.max(contentRef.current.scrollHeight - viewportRef.current.clientHeight, 0);
    setPull(0);
  }, [project.id]);

  useLayoutEffect(() => {
    gsap.set(contentRef.current, { y: -(maxPullRef.current - pull) });
  }, [pull]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { dragging: true, startY: e.clientY, startPull: pull };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const deltaY = dragState.current.startY - e.clientY; // dragging UP is positive
    if (deltaY <= 0) return; // only upward drag pulls the story into view
    const next = Math.min(maxPullRef.current, dragState.current.startPull + deltaY * FRICTION);
    setPull(next);
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  return (
    <div className="project-story">
      <p className="story-hint">↑ pull up to explore "{project.title}"</p>

      <div
        className="story-viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
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
              <img src={src} alt={project.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}