import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Code2, Sparkles, Cpu, Shirt, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Drop photos into /public/projects/<id>/ — cover.jpg for the fan card,
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
  icon: LucideIcon;
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
    icon: Code2,
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
    icon: Sparkles,
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
    icon: Cpu,
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
    icon: Shirt,
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
];

const N = PROJECTS.length;
const STEP_ANGLE = 26; // degrees between neighbouring cards
const SLOT_PX = 140; // px of drag needed to rotate one card

// Wraps a slot difference into the range (-N/2, N/2] so the fan always
// takes the shortest path round, like a real dial.
function wrapSlot(raw: number) {
  return (((raw + N / 2) % N) + N) % N - N / 2;
}

export default function ProjectsShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const offsetRef = useRef(0);
  const dragState = useRef({ dragging: false, startX: 0, startOffset: 0 });

  const layoutCards = (offset: number, animate: boolean) => {
    PROJECTS.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const slot = wrapSlot(i - offset);
      const abs = Math.abs(slot);
      const vars = {
        rotation: slot * STEP_ANGLE,
        y: -20 + abs * 26,
        scale: 1 - abs * 0.14,
        opacity: 1 - abs * 0.28,
        zIndex: Math.round((N - abs) * 10),
      };
      if (animate) {
        gsap.to(el, { ...vars, duration: 0.7, ease: "elastic.out(1,0.65)" });
      } else {
        gsap.set(el, vars);
      }
    });
  };

  // Initial layout, before paint, so cards don't flash in the wrong spot
  useLayoutEffect(() => {
    layoutCards(0, false);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { dragging: true, startX: e.clientX, startOffset: offsetRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const deltaX = e.clientX - dragState.current.startX;
    const newOffset = dragState.current.startOffset - deltaX / SLOT_PX;
    offsetRef.current = newOffset;
    layoutCards(newOffset, false);
  };

  const onPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const nearest = Math.round(offsetRef.current);
    offsetRef.current = nearest;
    layoutCards(nearest, true);
    setSelectedIndex(((nearest % N) + N) % N);
  };

  const selected = PROJECTS[selectedIndex] ?? PROJECTS[0]!;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-light">Projects</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag left or right — whichever card lands at the front is selected
        </p>
      </div>

      {/* Fan / demiclock carousel */}
      <div
        className="relative w-full max-w-md mx-auto h-[300px] cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {PROJECTS.map((p, i) => {
          const Icon = p.icon;
          const isFront = i === selectedIndex;
          return (
            <button
              key={p.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              tabIndex={-1}
              className={`absolute bottom-0 left-1/2 w-[168px] h-[220px] -ml-[84px] rounded-2xl border text-left overflow-hidden pointer-events-none ${
                isFront ? "border-warm" : "border-border"
              }`}
              style={{
                transformOrigin: "50% 100%",
                backgroundImage: `linear-gradient(160deg, ${p.accent}22, ${p.accent}55), url(${p.cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="h-full w-full flex flex-col justify-between p-4 bg-gradient-to-t from-black/50 via-black/0 to-transparent">
                <div className="flex items-center justify-between">
                  <Icon className="w-6 h-6 text-white drop-shadow" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/60 text-white">
                    {p.grade}
                  </span>
                </div>
                <div>
                  <p className="text-base font-medium leading-tight text-white drop-shadow">{p.title}</p>
                  {isFront && (
                    <p className="text-[11px] mt-1 flex items-center gap-1 text-white/80">
                      selected <ChevronDown className="w-3 h-3" />
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel — always shows whichever project is at the front */}
      <DetailPanel project={selected} />
    </div>
  );
}

function DetailPanel({ project }: { project: Project }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, [project.id]);

  return (
    <div ref={panelRef} className="w-full max-w-md mx-auto rounded-2xl border border-border p-6 bg-background/60">
      <p className="text-xl font-medium">{project.title}</p>
      <p className="text-xs text-muted-foreground mb-3">{project.grade} route</p>
      <p className="text-sm mb-5 text-muted-foreground">{project.description}</p>
      <GalleryStack key={project.id} project={project} />
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
      <div className="relative w-full h-[180px]">
        {project.gallery.map((img, i) => {
          const offset = (i - index + project.gallery.length) % project.gallery.length;
          if (offset > 2) return null; // only render the top 3 of the stack
          const isTop = offset === 0;
          return (
            <div
              key={img.id}
              ref={isTop ? topRef : undefined}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerLeave={isTop ? onUp : undefined}
              className="absolute inset-0 rounded-xl border border-border flex items-end p-4"
              style={{
                backgroundImage: `linear-gradient(160deg, ${project.accent}33, ${project.accent}77), url(${img.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.05})`,
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
      <p className="text-center text-xs mt-3 text-muted-foreground">
        {index + 1} / {project.gallery.length} — pull down to see next
      </p>
    </div>
  );
}