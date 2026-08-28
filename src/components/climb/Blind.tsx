import { useRef, useState, type ReactNode } from "react";

/**
 * A tab on the right edge. Drag it left (like a blind) to reveal a panel.
 * Controlled: the parent decides which blind is open so only one shows.
 */
export function Blind({
  label,
  top,
  index,
  isOpen,
  onOpenChange,
  children,
}: {
  label: string;
  top: number;
  index: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const [drag, setDrag] = useState<number | null>(null); // 0..1 while dragging
  const grip = useRef<{ x: number; start: number } | null>(null);

  const open = drag ?? (isOpen ? 1 : 0);

  const onDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    grip.current = { x: e.clientX, start: open };
    setDrag(open);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!grip.current) return;
    e.stopPropagation();
    const w = typeof window !== "undefined" ? window.innerWidth : 1000;
    const next = grip.current.start + (grip.current.x - e.clientX) / (w * 0.7);
    setDrag(Math.min(1, Math.max(0, next)));
  };

  const onUp = (e: React.PointerEvent) => {
    if (!grip.current) return;
    e.stopPropagation();
    grip.current = null;
    const v = drag ?? 0;
    setDrag(null);
    onOpenChange(v > 0.3);
  };

  return (
    <div
      className="pointer-events-none fixed right-0 z-30 flex items-start"
      style={{
        top,
        animation: `blind-tab-in 620ms cubic-bezier(.16,1,.3,1) ${index * 90}ms both`,
      }}
    >
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="group pointer-events-auto flex cursor-ew-resize items-center gap-3 rounded-l-lg border border-r-0 border-border bg-card/90 px-3 py-5 text-xs tracking-[0.3em] text-muted-foreground uppercase backdrop-blur-sm transition-all duration-300 select-none hover:border-warm/60 hover:text-warm"
        style={{
          writingMode: "vertical-rl",
          touchAction: "none",
          transform: `translateX(${-open * 8}px)`,
          boxShadow: "0 12px 40px -18px oklch(0 0 0 / 90%)",
        }}
      >
        <span
          className="h-8 w-px bg-border transition-colors duration-300 group-hover:bg-warm"
          aria-hidden
        />
        {label}
      </div>

      <div
        className="pointer-events-auto fixed inset-y-0 right-0 border-l border-border bg-card/95 backdrop-blur-md"
        style={{
          width: "min(700px, 90vw)",
          transform: `translateX(${(1 - open) * 100}%)`,
          transition: grip.current ? "none" : "transform 520ms cubic-bezier(.16,1,.3,1)",
          visibility: open === 0 ? "hidden" : "visible",
          boxShadow: "-40px 0 80px -40px oklch(0 0 0 / 90%)",
        }}
      >
        <div className="h-full overflow-y-auto p-10">
          <button
            onClick={() => onOpenChange(false)}
            className="mb-8 text-xs tracking-[0.3em] text-muted-foreground uppercase transition-colors hover:text-warm"
          >
            Close
          </button>
          <div style={{ opacity: open, transition: "opacity 300ms ease" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
