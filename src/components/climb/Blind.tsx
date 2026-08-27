import { useRef, useState, type ReactNode } from "react";

/**
 * A tab on the right edge. Drag it left (like a blind) to reveal a panel.
 */
export function Blind({
  label,
  top,
  children,
}: {
  label: string;
  top: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(0); // 0..1
  const drag = useRef<{ x: number; start: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: open };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    e.stopPropagation();
    const w = typeof window !== "undefined" ? window.innerWidth : 1000;
    const next = drag.current.start + (drag.current.x - e.clientX) / (w * 0.7);
    setOpen(Math.min(1, Math.max(0, next)));
  };

  const onUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    e.stopPropagation();
    drag.current = null;
    setOpen((o) => (o > 0.35 ? 1 : 0));
  };

  return (
    <div
      className="pointer-events-none fixed right-0 z-30 flex items-start"
      style={{ top }}
    >
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="pointer-events-auto cursor-ew-resize select-none touch-none rounded-l-md border border-r-0 border-border bg-card px-3 py-4 text-xs tracking-[0.3em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        style={{ writingMode: "vertical-rl" }}
      >
        {label}
      </div>

      <div
        className="pointer-events-auto fixed inset-y-0 right-0 border-l border-border bg-card/95 backdrop-blur-sm"
        style={{
          width: "min(560px, 88vw)",
          transform: `translateX(${(1 - open) * 100}%)`,
          transition: drag.current ? "none" : "transform 420ms cubic-bezier(.16,1,.3,1)",
          visibility: open === 0 ? "hidden" : "visible",
        }}
      >
        <div className="h-full overflow-y-auto p-10">
          <button
            onClick={() => setOpen(0)}
            className="mb-8 text-xs tracking-[0.3em] text-muted-foreground uppercase hover:text-foreground"
          >
            Close
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
