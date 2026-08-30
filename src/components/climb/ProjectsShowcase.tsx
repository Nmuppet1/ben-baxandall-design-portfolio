import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Drop photos into /public/projects/<id>/ — cover.jpg for the stack card,
 * 1.jpg..4.jpg for the gallery. Missing files just fall back to the
 * accent-colour gradient so nothing breaks while you're adding photos.
 */

interface GalleryImage {
  id: string;
  label: string;
  src: string;
}

interface Project {
  id: string;
  title: string;
  grade: string;
  accent: string;
  cover: string;
  description: string;
  gallery: GalleryImage[];
}

const PROJECTS: Project[] = [
  {
    id: "web",
    title: "Web Design",
    grade: "V4",
    accent: "#c1633c",
    cover: "/projects/web/cover.jpg",
    description:
      "Interfaces built where engineering meets craft — design systems, layout logic, and interaction detail.",
    gallery: [
      { id: "w1", label: "Homepage concept", src: "/projects/web/1.jpg" },
      { id: "w2", label: "Design tokens", src: "/projects/web/2.jpg" },
      { id: "w3", label: "Component library", src: "/projects/web/3.jpg" },
      { id: "w4", label: "Responsive states", src: "/projects/web/4.jpg" },
    ],
  },
  {
    id: "anim",
    title: "Animations",
    grade: "V6",
    accent: "#6f8a5e",
    cover: "/projects/anim/cover.jpg",
    description:
      "Motion studies exploring timing, easing, and physical feel — from micro-interactions to full sequences.",
    gallery: [
      { id: "a1", label: "Easing study", src: "/projects/anim/1.jpg" },
      { id: "a2", label: "Character rig", src: "/projects/anim/2.jpg" },
      { id: "a3", label: "Loop cycle", src: "/projects/anim/3.jpg" },
      { id: "a4", label: "Transition set", src: "/projects/anim/4.jpg" },
    ],
  },
  {
    id: "elec",
    title: "Electronics",
    grade: "V7",
    accent: "#4a6fa5",
    cover: "/projects/elec/cover.jpg",
    description:
      "Circuit design and embedded builds — from breadboard prototypes to soldered, working boards.",
    gallery: [
      { id: "e1", label: "Schematic v1", src: "/projects/elec/1.jpg" },
      { id: "e2", label: "PCB layout", src: "/projects/elec/2.jpg" },
      { id: "e3", label: "Breadboard test", src: "/projects/elec/3.jpg" },
      { id: "e4", label: "Final build", src: "/projects/elec/4.jpg" },
    ],
  },
  {
    id: "kit",
    title: "Dodgy Ballers Kit",
    grade: "V3",
    accent: "#b0562f",
    cover: "/projects/kit/cover.jpg",
    description:
      "A kit design project — bold graphics and a slightly cheeky brand identity for a five-a-side team.",
    gallery: [
      { id: "k1", label: "Kit concept", src: "/projects/kit/1.jpg" },
      { id: "k2", label: "Crest design", src: "/projects/kit/2.jpg" },
      { id: "k3", label: "Fabric mockup", src: "/projects/kit/3.jpg" },
      { id: "k4", label: "Team photo", src: "/projects/kit/4.jpg" },
    ],
  },
  {
  id: "dt",
    title: "Design Technology- Climbing Board",
    grade: "V3",
    accent: "#f49cf1",
    cover: "/projects/kit/cover.jpg",
    description:
      "A project experiencing full design lifecycle from concept to final product and branding.",
    gallery: [
      { id: "k1", label: "Kit concept", src: "/projects/kit/1.jpg" },
      { id: "k2", label: "Crest design", src: "/projects/kit/2.jpg" },
      { id: "k3", label: "Fabric mockup", src: "/projects/kit/3.jpg" },
      { id: "k4", label: "Team photo", src: "/projects/kit/4.jpg" },
    ],
  },
];

const N = PROJECTS.length;
const CARD_W = 170;
const CARD_H = 210;
const STACK_STEP_X = 34; // px each remaining card sits further right
const STACK_STEP_Y = 8; // px each remaining card sits further down
const DRAG_PX_PER_STEP = 130; // px of drag to move one card

export default function ProjectsShowcase() {
  const [frontIndex, setFrontIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
  const dragState = useRef({ dragging: false, startX: 0, startIndex: 0 });

  const layoutCards = (index: number, animate: boolean) => {
    PROJECTS.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const offset = i - index;

      // offset >= 0: still ahead (or current) — recedes in a line to the right
      // offset < 0: already passed — slides away and fades instead of piling up
      const vars =
        offset >= 0
          ? {
              x: offset * STACK_STEP_X,
              y: offset * STACK_STEP_Y,
              scale: 1 - offset * 0.07,
              opacity: Math.max(0.25, 1 - offset * 0.2),
              zIndex: Math.round((N - offset) * 10),
            }
          : {
              x: offset * 60,
              y: -offset * 10,
              scale: Math.max(0.7, 1 + offset * 0.3),
              opacity: Math.max(0, 1 + offset * 1.6),
              zIndex: 5,
            };

      if (animate) {
        gsap.to(el, { ...vars, duration: 0.6, ease: "power3.out" });
      } else {
        gsap.set(el, vars);
      }
    });
  };

  useLayoutEffect(() => {
    layoutCards(0, false);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { dragging: true, startX: e.clientX, startIndex: indexRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const deltaX = e.clientX - dragState.current.startX;
    const raw = dragState.current.startIndex - deltaX / DRAG_PX_PER_STEP;
    const clamped = Math.min(Math.max(raw, 0), N - 1); // hard stop at either end
    indexRef.current = clamped;
    layoutCards(clamped, false);
  };

  const onPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const snapped = Math.min(Math.max(Math.round(indexRef.current), 0), N - 1);
    indexRef.current = snapped;
    layoutCards(snapped, true);
    setFrontIndex(snapped);
  };

  const selected = PROJECTS[frontIndex] ?? PROJECTS[0]!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-light">Projects</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag the stack — it stops at the first and last project
        </p>
      </div>

      {/* Photo stack — no text on the cards themselves */}
      <div
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: CARD_W + STACK_STEP_X * (N - 1) + 20,
          height: CARD_H + STACK_STEP_Y * (N - 1) + 20,
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {PROJECTS.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 overflow-hidden rounded-2xl border border-border"
            style={{
              width: CARD_W,
              height: CARD_H,
              backgroundImage: `linear-gradient(160deg, ${p.accent}22, ${p.accent}55), url(${p.cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
      </div>

      {/* All text lives here, off the photos, updating with the selection */}
      <DetailText project={selected} />

      <GalleryStack key={selected.id} project={selected} />
    </div>
  );
}

function DetailText({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
  }, [project.id]);

  return (
    <div ref={ref}>
      <div className="flex items-center gap-2">
        <p className="text-xl font-medium">{project.title}</p>
        <span className="rounded-full border border-warm px-1.5 py-0.5 text-[10px] text-warm">
          {project.grade}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
    </div>
  );
}

function GalleryStack({ project }: { project: Project }) {
  const [index, setIndex] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startY: 0 });
  const THRESHOLD = 70;

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { dragging: true, startY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging || !topRef.current) return;
    const deltaY = Math.max(0, e.clientY - dragState.current.startY);
    gsap.set(topRef.current, { y: deltaY, opacity: 1 - deltaY / 240 });
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging || !topRef.current) return;
    dragState.current.dragging = false;
    const deltaY = Math.max(0, e.clientY - dragState.current.startY);

    if (deltaY > THRESHOLD) {
      gsap.to(topRef.current, {
        y: 260,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => setIndex((i) => (i + 1) % project.gallery.length),
      });
    } else {
      gsap.to(topRef.current, { y: 0, opacity: 1, duration: 0.5, ease: "elastic.out(1,0.7)" });
    }
  };

  return (
    <div>
      <div className="relative h-[180px] w-full">
        {project.gallery.map((img, i) => {
          const offset = (i - index + project.gallery.length) % project.gallery.length;
          if (offset > 2) return null; // only render the top 3 of the stack
          const isTop = offset === 0;
          const stackY = -offset * 10; // stacked above the front photo, not below

          return (
            <div
              key={img.id}
              ref={isTop ? topRef : undefined}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerLeave={isTop ? onUp : undefined}
              className="absolute inset-0 flex items-end rounded-xl border border-border p-4"
              style={{
                backgroundImage: `linear-gradient(160deg, ${project.accent}33, ${project.accent}77), url(${img.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateY(${stackY}px) scale(${1 - offset * 0.05})`,
                zIndex: 10 - offset,
                opacity: 1 - offset * 0.15,
                cursor: isTop ? "grab" : "default",
                touchAction: "none",
              }}
            >
              <p className="text-sm text-white drop-shadow">{img.label}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {index + 1} / {project.gallery.length} — pull down to see next
      </p>
    </div>
  );
}