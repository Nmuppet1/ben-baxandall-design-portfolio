import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import "./ProjectGallery.css";

gsap.registerPlugin(Draggable);

export type Project = {
  id: string;
  title: string;
  thumb: string; // square image
  description: string;
  images: string[]; // full story photos, natural aspect ratio
};

// Swap in your real projects
export const PROJECTS: Project[] = [
  { id: "p1", title: "Project One", thumb: "public/elec/PID.png", description: "Description of project one.", images: ["public/elec/PID.png", "public/elec/PID.png"] },
  { id: "p2", title: "Project Two", thumb: "public/elec/PID.png", description: "Description of project two.", images: ["public/elec/PID.png", "public/elec/PID.png"] },
  { id: "p3", title: "Project Three", thumb: "public/elec/PID.png", description: "Description of project three.", images: ["public/elec/PID.png", "public/elec/PID.png"] },
  { id: "p4", title: "Project Four", thumb: "public/elec/PID.png", description: "Description of project four.", images: ["public/elec/PID.png", "public/elec/PID.png"] },
];

const SPACING = 0.1;

// Unchanged from the official GSAP demo — builds a timeline that can be
// scrubbed infinitely in either direction and appears to loop seamlessly.
function buildSeamlessLoop(items: HTMLElement[], spacing: number, animateFunc: (el: HTMLElement) => gsap.core.Timeline) {
  const overlap = Math.ceil(1 / spacing);
  const startTime = items.length * spacing + 0.5;
  const loopTime = (items.length + overlap) * spacing + 1;
  const rawSequence = gsap.timeline({ paused: true });
  const seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      // @ts-expect-error — internal timing workaround, straight from the official demo
      if (this._time === this._dur) this._tTime += this._dur - 0.01;
    },
  });
  const l = items.length + overlap * 2;

  for (let i = 0; i < l; i++) {
    const index = i % items.length;
    const time = i * spacing;
    rawSequence.add(animateFunc(items[index]!), time);
  }

  rawSequence.time(startTime);
  seamlessLoop
    .to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: "none" })
    .fromTo(
      rawSequence,
      { time: overlap * spacing + 1 },
      { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" }
    );
  return seamlessLoop;
}

export default function ProjectGallery({ onSelect }: { onSelect: (project: Project) => void }) {
  const listRef = useRef<HTMLUListElement>(null);
  const proxyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = gsap.utils.toArray<HTMLElement>(list.children);

    gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });

    const animateFunc = (element: HTMLElement) => {
      const tl = gsap.timeline();
      tl.fromTo(
        element,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false }
      ).fromTo(
        element,
        { xPercent: 400 },
        { xPercent: -400, duration: 1, ease: "none", immediateRender: false },
        0
      );
      return tl;
    };

    const seamlessLoop = buildSeamlessLoop(cards, SPACING, animateFunc);
    const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());
    const snapTime = gsap.utils.snap(SPACING);

    let lastIndex = -1;
    const reportActive = (offset: number) => {
      const rawIndex = Math.round(offset / SPACING);
      const index = gsap.utils.wrap(0, PROJECTS.length, rawIndex);
      if (index !== lastIndex) {
        lastIndex = index;
        onSelect(PROJECTS[index]!);
      }
    };

    const scrub = gsap.to(
      { offset: 0 },
      {
        offset: 0,
        duration: 0.5,
        ease: "power3",
        paused: true,
        onUpdate() {
          const offset = (this["targets"]()[0] as { offset: number })["offset"];
          seamlessLoop.time(wrapTime(offset));
          reportActive(offset);
        },
      }
    );

    const instances = Draggable.create(proxyRef.current, {
      type: "x",
      trigger: list,
      onPress() {
        gsap.killTweensOf(scrub.vars);
        (this as any).startOffset = (scrub.vars as any).offset as number;
      },
      onDrag() {
        (scrub.vars as any).offset = (this as any).startOffset + (this["startX"] - this["x"]) * 0.001;
        scrub.invalidate().restart();
      },
      onDragEnd() {
        const snapped = snapTime((scrub.vars as any).offset as number);
        (scrub.vars as any).offset = snapped;
        scrub.invalidate().restart();
      },
    });

    reportActive(0);

    return () => {
      instances.forEach((d) => d.kill());
      scrub.kill();
      seamlessLoop.kill();
    };
  }, [onSelect]);

  return (
    <div className="gallery">
      <div className="drag-proxy" ref={proxyRef} />
      <ul className="cards" ref={listRef}>
        {PROJECTS.map((project) => (
          <li key={project.id} style={{ backgroundImage: `url(${project.thumb})` }}>
            <span className="card-title">{project.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}