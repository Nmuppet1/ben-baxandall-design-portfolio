import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Blind } from "@/components/climb/Blind";
import { CLIMB_HEIGHT, HOLDS, SECTIONS } from "@/components/climb/holds";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ben — Design Portfolio, Climb to Explore" },
      {
        name: "description",
        content:
          "A minimal, interactive design portfolio. Pull on the holds to climb the page and reveal projects, skills and contact.",
      },
      { property: "og:title", content: "Ben — Design Portfolio, Climb to Explore" },
      {
        property: "og:description",
        content:
          "A minimal, interactive design portfolio you climb instead of scroll.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [climb, setClimb] = useState(0);
  const climbRef = useRef(0);
  const vel = useRef(0);
  const grip = useRef<{ y: number; start: number } | null>(null);

  // physics loop: momentum + friction + a little gravity sag
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!grip.current) {
        vel.current *= 0.9; // friction
        vel.current -= 0.35; // gravity
        if (climbRef.current <= 0 && vel.current < 0) vel.current = 0;
        set(climbRef.current + vel.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const set = (v: number) => {
    const next = Math.min(CLIMB_HEIGHT - 400, Math.max(0, v));
    if (next !== climbRef.current) {
      climbRef.current = next;
      setClimb(next);
    }
  };

  const onGrab = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    grip.current = { y: e.clientY, start: climbRef.current };
    vel.current = 0;
  };

  const onPull = (e: React.PointerEvent) => {
    if (!grip.current) return;
    const target = grip.current.start + (e.clientY - grip.current.y) * 0.85;
    vel.current = target - climbRef.current;
    set(target);
  };

  const release = () => {
    grip.current = null;
  };

  const p = climb / (CLIMB_HEIGHT - 400);

  return (
    <main
      onPointerMove={onPull}
      onPointerUp={release}
      onPointerCancel={release}
      className="relative h-screen w-full touch-none overflow-hidden bg-background text-foreground select-none"
    >
      {/* the wall */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: CLIMB_HEIGHT,
          transform: `translateY(${climb}px)`,
        }}
      >
        {/* intro at the very bottom */}
        <div className="absolute inset-x-0 bottom-0 flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-5xl font-light tracking-tight md:text-7xl">Ben</h1>
          <p className="max-w-md text-sm tracking-[0.25em] text-muted-foreground uppercase">
            Design enthusiast in interface, motion &amp; brand
          </p>
          <p className="mt-10 animate-pulse text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Grab a hold and pull down to climb
          </p>
        </div>

        {/* holds */}
        {HOLDS.map((h) => (
          <button
            key={h.id}
            onPointerDown={onGrab}
            aria-label="Climbing hold"
            className="absolute cursor-grab rounded-[45%] border border-border bg-card transition-[background-color,box-shadow] duration-200 hover:bg-accent active:cursor-grabbing"
            style={{
              left: `${h.x * 100}%`,
              bottom: h.y,
              width: h.size,
              height: h.size * 0.72,
              transform: `translate(-50%, 50%) rotate(${h.rot}deg)`,
              boxShadow: "0 8px 24px -12px oklch(0 0 0 / 80%)",
            }}
          />
        ))}

        {/* section markers on the wall */}
        {SECTIONS.map((s) => (
          <div
            key={s.id}
            className="absolute left-8 text-xs tracking-[0.35em] text-muted-foreground uppercase"
            style={{ bottom: s.at }}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* height gauge */}
      <div className="pointer-events-none fixed bottom-6 left-6 text-xs tracking-[0.3em] text-muted-foreground uppercase">
        {Math.round(p * 100)} m
      </div>

      {/* tabs revealed as you gain height */}
      {SECTIONS.map((s, i) =>
        climb > s.at - 200 ? (
          <Blind key={s.id} label={s.label} top={120 + i * 150}>
            <SectionBody id={s.id} />
          </Blind>
        ) : null,
      )}
    </main>
  );
}

function SectionBody({ id }: { id: string }) {
  if (id === "projects") {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-light">Projects</h2>
        {["Atlas — design system", "Field — mobile app", "Rope — brand identity"].map(
          (t) => (
            <div key={t} className="border-t border-border pt-4">
              <p className="text-lg">{t}</p>
              <p className="text-sm text-muted-foreground">Case study coming soon.</p>
            </div>
          ),
        )}
      </div>
    );
  }
  if (id === "skills") {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-light">Skills</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {["Interface design", "Motion & prototyping", "Brand systems", "Design ops"].map(
            (s) => (
              <li key={s} className="border-t border-border pt-2">
                {s}
              </li>
            ),
          )}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-light">Contact</h2>
      <p className="text-sm text-muted-foreground">
        Always up for a new route. Say hello.
      </p>
      <a className="text-lg underline underline-offset-4" href="mailto:hello@example.com">
        hello@example.com
      </a>
    </div>
  );
}
