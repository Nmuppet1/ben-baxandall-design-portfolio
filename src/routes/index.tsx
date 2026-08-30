import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChalkPuff, type Puff } from "@/components/climb/Chalk";
import { Sunset } from "@/components/climb/Sunset";
import { generateHolds } from "@/components/climb/holds";
import ProjectsShowcase from "@/components/climb/ProjectsShowcase";
import SkillsBarrels from "@/components/climb/SkillsBarrels";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ben — Design Portfolio" },
      {
        name: "description",
        content: " Pull on the holds to climb the page",
      },
      { property: "og:title", content: "Ben — Design Portfolio" },
      {
        property: "og:description",
        content: "Climb to scroll!",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [climb, setClimb] = useState(0);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [wallHeight, setWallHeight] = useState(0);

  const climbRef = useRef(0);
  const wallHeightRef = useRef(0);
  const vel = useRef(0);
  const grip = useRef<{ y: number; start: number } | null>(null);
  const puffId = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure the wall's real height from its rendered content (intro +
  // all four sections) instead of a hardcoded constant, so it always
  // matches however long the page actually is.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setWallHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    wallHeightRef.current = wallHeight;
  }, [wallHeight]);

  // Round so a resize by a few px doesn't reshuffle every hold on screen
  const holdsHeightKey = Math.round(wallHeight / 50) * 50;
  const holds = useMemo(() => generateHolds(holdsHeightKey), [holdsHeightKey]);

  // physics loop: momentum + friction + a little gravity sag
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!grip.current) {
        vel.current *= 0.45; // friction slows the swing after a pull
        if (Math.abs(vel.current) > 0.2) set(climbRef.current + vel.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const set = (v: number) => {
    const maxClimb = Math.max(wallHeightRef.current - window.innerHeight, 0);
    const next = Math.min(maxClimb, Math.max(0, v));
    if (next !== climbRef.current) {
      climbRef.current = next;
      setClimb(next);
    }
  };

  const onGrab = (e: React.PointerEvent, hold: (typeof holds)[number]) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    grip.current = { y: e.clientY, start: climbRef.current };
    vel.current = 0;

    const id = ++puffId.current;
    setPuffs((p) => [
      ...p.slice(-8),
      { id, left: `${hold.x * 100}%`, bottom: hold.y, seed: hold.rot },
    ]);
    setTimeout(() => setPuffs((p) => p.filter((x) => x.id !== id)), 1600);
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

  const maxClimb = Math.max(wallHeight - (typeof window !== "undefined" ? window.innerHeight : 800), 1);
  const p = climb / maxClimb;

  return (
    <main
      onPointerMove={onPull}
      onPointerUp={release}
      onPointerCancel={release}
      className="relative h-screen w-full touch-none overflow-hidden bg-background text-foreground select-none"
    >
      <Sunset t={p} />

      {/* drifting haze for a bit of life */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 100%, oklch(0.2 0.02 60 / 45%), transparent 70%)",
          animation: "haze 14s ease-in-out infinite",
        }}
        aria-hidden
      />

      {/* the wall — flex-col-reverse means the first child sits at the
          bottom (the start of the climb), each next child stacks above it */}
      <div
        ref={contentRef}
        className="absolute inset-x-0 bottom-0 flex flex-col-reverse"
        style={{ transform: `translateY(${climb}px)` }}
      >
        {/* chalk left on grabbed holds */}
        {puffs.map((puff) => (
          <ChalkPuff key={puff.id} puff={puff} />
        ))}

        {/* holds, scattered across the full wall height */}
        {holds.map((h) => (
          <button
            key={h.id}
            onPointerDown={(e) => onGrab(e, h)}
            aria-label="Climbing hold"
            className={`absolute z-10 cursor-grab transition-[filter,opacity] duration-300 hover:brightness-125 active:cursor-grabbing ${
              h.warm ? "bg-warm/80" : "bg-card"
            }`}
            style={{
              left: `${h.x * 100}%`,
              bottom: h.y,
              width: h.size,
              height: h.size * 0.72,
              clipPath: h.clip,
              transform: `translate(-50%, 50%) rotate(${h.rot}deg)`,
              filter: `drop-shadow(0 8px 16px oklch(0 0 0 / 70%))`,
              animation: `hold-sway ${5 + (h.id % 5)}s ease-in-out ${h.id * 0.13}s infinite`,
            }}
          />
        ))}

        {/* sections, in climb order: intro, then Projects / Skills / Interests / Contact */}
        <IntroSection />

        <WallSection side="left">
          <ProjectsShowcase />
        </WallSection>

        <WallSection side="right">
          <h2 className="mb-8 text-3xl font-light">Skills</h2>
          <SkillsBarrels />
        </WallSection>

        <WallSection side="left">
          <InterestsSection />
        </WallSection>

        <WallSection side="right">
          <ContactSection />
        </WallSection>
      </div>

      {/* height gauge */}
      <div className="pointer-events-none fixed bottom-6 left-6 flex items-center gap-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">
        <span className="block h-px w-10 bg-warm/60" />
        <span className="text-warm">{Math.round(p * 100)}</span> %
      </div>
    </main>
  );
}

function IntroSection() {
  return (
    <div className="relative z-20 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <h1
          className="text-5xl font-light tracking-tight md:text-7xl"
          style={{ animation: "rise-in 900ms cubic-bezier(.16,1,.3,1) both" }}
        >
          Ben Baxandall
        </h1>
        <p
          className="max-w-md text-sm tracking-[0.25em] text-muted-foreground uppercase"
          style={{ animation: "rise-in 900ms cubic-bezier(.16,1,.3,1) 140ms both" }}
        >
           I am an enthusiast in design, engineering and climbing. I love creating things that are both fun and functional. 
        </p>
        <p
          className="mt-10 text-xs tracking-[0.3em] text-warm uppercase"
          style={{ animation: "breathe 3s ease-in-out infinite" }}
        >
          This page has no scrollbars to give the sense of a true, tough climb. Pull on the holds to scale the page!
        </p>
      </div>
    </div>
  );
}

// Alternates a section's content block to the left or right edge of the
// wall, mirroring the original align-left/align-right pattern: the
// section itself lets clicks pass through to the holds behind it, and
// only the content block re-enables pointer events.
function WallSection({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <section className="relative z-20 flex min-h-screen w-full items-center px-6 pointer-events-none md:px-16">
      <div
        className={`pointer-events-auto w-full max-w-x1 ${
          side === "left" ? "mr-auto text-left" : "ml-auto text-right"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function InterestsSection() {
  // Placeholder — swap these for your real interests
  const interests = ["Raspberry Pi", "3D Printing", "Animation", "Wild Swimming", "Football", "Running", "Cooking", "Guitar", "Reading"];

  return (
    <div>
      <h2 className="mb-4 text-3xl font-light">Interests</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        A few things I spend time on outside of design and engineering, influencing the way I approach challenges.
      </p>
      <ul className="flex flex-wrap justify-end gap-2">
        {interests.map((i) => (
          <li key={i} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-light">Contact</h2>
      <p className="text-sm text-muted-foreground">Feel free to reach out and say hello!</p>
      <a
        className="text-lg text-warm underline underline-offset-4"
        href="mailto:benbaxandall@btinternet.com"
      >
        benbaxandall@btinternet.com
      </a>
    </div>
  );
}