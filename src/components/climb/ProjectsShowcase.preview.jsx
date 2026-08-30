import { useState, useRef } from "react";
import { Code2, Sparkles, Cpu, Shirt, X, ChevronDown } from "lucide-react";

/*
  PLACEHOLDER IMAGES
  Every card below uses a CSS gradient instead of a real photo, since none
  were provided. To use your real photos, add an `image` field, e.g.:
    { id: "w1", label: "Homepage concept", image: "/projects/web/1.jpg" }
  and swap the `background: linear-gradient(...)` line for:
    background: img.image ? `url(${img.image}) center/cover` : fallbackGradient
*/

const COLORS = {
  bg: "#f5f3ee",
  fg: "#2b2b28",
  muted: "#8a8578",
  border: "#ddd8cd",
};

const PROJECTS = [
  {
    id: "web",
    title: "Web Design",
    grade: "V4",
    icon: Code2,
    accent: "#c1633c",
    description:
      "Interfaces built where engineering meets craft — design systems, layout logic, and interaction detail.",
    gallery: [
      { id: "w1", label: "Homepage concept" },
      { id: "w2", label: "Design tokens" },
      { id: "w3", label: "Component library" },
      { id: "w4", label: "Responsive states" },
    ],
  },
  {
    id: "anim",
    title: "Animations",
    grade: "V6",
    icon: Sparkles,
    accent: "#6f8a5e",
    description:
      "Motion studies exploring timing, easing, and physical feel — from micro-interactions to full sequences.",
    gallery: [
      { id: "a1", label: "Easing study" },
      { id: "a2", label: "Character rig" },
      { id: "a3", label: "Loop cycle" },
      { id: "a4", label: "Transition set" },
    ],
  },
  {
    id: "elec",
    title: "Electronics",
    grade: "V7",
    icon: Cpu,
    accent: "#4a6fa5",
    description:
      "Circuit design and embedded builds — from breadboard prototypes to soldered, working boards.",
    gallery: [
      { id: "e1", label: "Schematic v1" },
      { id: "e2", label: "PCB layout" },
      { id: "e3", label: "Breadboard test" },
      { id: "e4", label: "Final build" },
    ],
  },
  {
    id: "kit",
    title: "Dodgy Ballers Kit",
    grade: "V3",
    icon: Shirt,
    accent: "#b0562f",
    description:
      "A kit design project — bold graphics and a slightly cheeky brand identity for a five-a-side team.",
    gallery: [
      { id: "k1", label: "Kit concept" },
      { id: "k2", label: "Crest design" },
      { id: "k3", label: "Fabric mockup" },
      { id: "k4", label: "Team photo" },
    ],
  },
];

const ANGLES = [-27, -9, 9, 27]; // fan spread, "demiclock" arc
const PULL_THRESHOLD = 90;

export default function ProjectsShowcase() {
  const [selectedId, setSelectedId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef(0);

  const selected = PROJECTS.find((p) => p.id === selectedId) || null;

  const onPointerDown = (e, id) => {
    if (selectedId) return;
    dragStart.current = e.clientY;
    setDragId(id);
    setDragY(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragId) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  };

  const onPointerUp = () => {
    if (!dragId) return;
    if (dragY > PULL_THRESHOLD) setSelectedId(dragId);
    setDragId(null);
    setDragY(0);
  };

  return (
    <div
      style={{ background: COLORS.bg, color: COLORS.fg }}
      className="w-full min-h-[640px] px-6 py-12 flex flex-col items-center font-sans"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <h2 className="text-3xl font-light mb-2">Projects</h2>
      <p className="text-sm mb-10" style={{ color: COLORS.muted }}>
        {selected ? "Pull the gallery below to explore" : "Pull a card down to select"}
      </p>

      {/* Fan / demiclock z-stack */}
      <div className="relative w-full max-w-md h-[300px]" style={{ marginBottom: selected ? 24 : 0 }}>
        {PROJECTS.map((p, i) => {
          const Icon = p.icon;
          const isSelected = selectedId === p.id;
          const isDragging = dragId === p.id;
          const pull = isDragging ? Math.min(dragY / PULL_THRESHOLD, 1.4) : 0;
          const baseAngle = ANGLES[i];

          const angle = selectedId ? (isSelected ? 0 : baseAngle * 0.6) : baseAngle * (1 - pull * 0.7);
          const translateY = selectedId ? (isSelected ? -30 : 40) : -pull * 60;
          const scale = selectedId ? (isSelected ? 1.08 : 0.86) : 1 + pull * 0.05;
          const opacity = selectedId ? (isSelected ? 1 : 0.35) : 1;
          const z = isDragging ? 50 : isSelected ? 40 : 10 + i;

          return (
            <button
              key={p.id}
              onPointerDown={(e) => onPointerDown(e, p.id)}
              disabled={!!selectedId}
              className="absolute bottom-0 left-1/2 w-[168px] h-[220px] -ml-[84px] rounded-2xl border text-left overflow-hidden"
              style={{
                transformOrigin: "50% 100%",
                transform: `rotate(${angle}deg) translateY(${translateY}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 480ms cubic-bezier(.16,1,.3,1), opacity 480ms",
                zIndex: z,
                opacity,
                borderColor: COLORS.border,
                background: `linear-gradient(160deg, ${p.accent}22, ${p.accent}55)`,
                cursor: selectedId ? "default" : isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            >
              <div className="h-full w-full flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <Icon className="w-6 h-6" style={{ color: p.accent }} />
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full border"
                    style={{ borderColor: p.accent, color: p.accent }}
                  >
                    {p.grade}
                  </span>
                </div>
                <div>
                  <p className="text-base font-medium leading-tight">{p.title}</p>
                  {!selectedId && (
                    <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: COLORS.muted }}>
                      pull to select <ChevronDown className="w-3 h-3" />
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className="w-full max-w-md rounded-2xl border p-6"
          style={{ borderColor: COLORS.border, background: "#ffffffaa", animation: "rise-in 500ms cubic-bezier(.16,1,.3,1) both" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xl font-medium">{selected.title}</p>
              <p className="text-xs" style={{ color: COLORS.muted }}>{selected.grade} route</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="rounded-full border w-8 h-8 flex items-center justify-center shrink-0"
              style={{ borderColor: COLORS.border }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm mb-5">{selected.description}</p>
          <GalleryStack project={selected} />
        </div>
      )}

      <style>{`
        @keyframes rise-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function GalleryStack({ project }) {
  const [index, setIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const THRESHOLD = 70;

  const onDown = (e) => {
    startY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const onUp = () => {
    if (dragY > THRESHOLD) setIndex((i) => (i + 1) % project.gallery.length);
    setDragging(false);
    setDragY(0);
  };

  return (
    <div>
      <div className="relative w-full h-[180px]" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        {project.gallery.map((img, i) => {
          const offset = (i - index + project.gallery.length) % project.gallery.length;
          if (offset > 2) return null; // only render top 3 of the stack
          const isTop = offset === 0;
          const y = isTop ? dragY : 0;
          const scale = 1 - offset * 0.05;
          const stackY = offset * 10;
          const opacity = isTop ? 1 - dragY / 240 : 1 - offset * 0.15;

          return (
            <div
              key={img.id}
              onPointerDown={isTop ? onDown : undefined}
              className="absolute inset-0 rounded-xl border flex items-end p-4"
              style={{
                borderColor: "#ddd8cd",
                background: `linear-gradient(160deg, ${project.accent}33, ${project.accent}77)`,
                transform: `translateY(${stackY + y}px) scale(${scale})`,
                transition: isTop && dragging ? "none" : "transform 420ms cubic-bezier(.16,1,.3,1), opacity 420ms",
                zIndex: 10 - offset,
                opacity,
                cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
                touchAction: "none",
              }}
            >
              <p className="text-sm text-white drop-shadow">{img.label}</p>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs mt-3" style={{ color: "#8a8578" }}>
        {index + 1} / {project.gallery.length} — pull down to see next
      </p>
    </div>
  );
}
