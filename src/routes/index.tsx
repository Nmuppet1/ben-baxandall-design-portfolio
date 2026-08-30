import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Blind } from "@/components/climb/Blind";
import { ChalkPuff, type Puff } from "@/components/climb/Chalk";
import { Sunset } from "@/components/climb/Sunset";
import { CLIMB_HEIGHT, HOLDS, SECTIONS } from "@/components/climb/holds";
import ProjectsShowcase from "@/components/climb/ProjectsShowcase";

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const climbRef = useRef(0);
  const vel = useRef(0);
  const grip = useRef<{ y: number; start: number } | null>(null);
  const puffId = useRef(0);

  // physics loop: momentum + friction + a little gravity sag
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!grip.current) {
        vel.current *= 0.55; // friction slows the swing after a pull
        if (Math.abs(vel.current) > 0.2) set(climbRef.current + vel.current);
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

  const onGrab = (e: React.PointerEvent, hold: (typeof HOLDS)[number]) => {
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

  const p = climb / (CLIMB_HEIGHT - 400);
  const visible = SECTIONS.filter((s) => climb > s.at - 200);
  const shown = openId ? visible.filter((s) => s.id === openId) : visible;

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
          <h1
            className="text-5xl font-light tracking-tight md:text-7xl"
            style={{ animation: "rise-in 900ms cubic-bezier(.16,1,.3,1) both" }}
          >
            Ben
          </h1>
          <p
            className="max-w-md text-sm tracking-[0.25em] text-muted-foreground uppercase"
            style={{ animation: "rise-in 900ms cubic-bezier(.16,1,.3,1) 140ms both" }}
          >
            Enthusiast in design, engineering and climbing &amp; brand
          </p>
          <p
            className="mt-10 text-xs tracking-[0.3em] text-warm uppercase"
            style={{ animation: "breathe 3s ease-in-out infinite" }}
          >
            Grab a hold and pull to climb
          </p>
        </div>

        {/* chalk left on grabbed holds */}
        {puffs.map((puff) => (
          <ChalkPuff key={puff.id} puff={puff} />
        ))}

        {/* holds */}
        {HOLDS.map((h) => (
          <button
            key={h.id}
            onPointerDown={(e) => onGrab(e, h)}
            aria-label="Climbing hold"
            className={`absolute cursor-grab transition-[filter,opacity] duration-300 hover:brightness-125 active:cursor-grabbing ${
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
      </div>

      {/* height gauge */}
      <div className="pointer-events-none fixed bottom-6 left-6 flex items-center gap-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">
        <span className="block h-px w-10 bg-warm/60" />
        <span className="text-warm">{Math.round(p * 100)}</span> %
      </div>

      {/* tabs revealed as you gain height */}
      {shown.map((s, i) => (
        <Blind
          key={s.id}
          label={s.label}
          top={120 + i * 150}
          index={i}
          isOpen={openId === s.id}
          onOpenChange={(o) => setOpenId(o ? s.id : null)}
        >
          <SectionBody id={s.id} />
        </Blind>
      ))}
    </main>
  );
}

function SectionBody({ id }: { id: string }) {

  if (id === "projects") {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-light">Projects</h2>
          return <ProjectsShowcase />;
      </div>
    );
  }

  
  if (id === "skills") {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-light">Skills</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {["Interface design", "Motion & prototyping", "Brand systems", "Design ops"].map(
            (s, i) => (
              <li
                key={s}
                className="border-t border-border pt-2 transition-colors hover:text-warm"
                style={{
                  animation: `rise-in 600ms cubic-bezier(.16,1,.3,1) ${120 + i * 70}ms both`,
                }}
              >
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
          Feel free to reach out and say hello!
      </p>
      <a
        className="text-lg text-warm underline underline-offset-4"
        href="mailto:benbaxandall@btinternet.com"
      >
        benbaxandall@btinternet.com
      </a>
    </div>
  );
}
