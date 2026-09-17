import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { ChalkPuff, type Puff } from "@/components/climb/Chalk";
import { Sunset } from "@/components/climb/Sunset";
import { generateHolds, type Zone } from "@/components/climb/holds";
import SkillsBarrels from "@/components/climb/SkillsBarrels";
import ProjectGallery, { PROJECTS, type Project } from "@/components/climb/ProjectGallery";
import ProjectStory from "@/components/climb/ProjectStory";
import BenName from "@/components/climb/BenName";
import Reveal from "@/components/climb/Reveal";
import InterestDoodle from "@/components/climb/InterestDoodles";
import MountainProgress from "@/components/climb/MountainProgress";
import { Analytics } from "@vercel/analytics/react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ben Baxandall — Design Portfolio" },
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
  const [active, setActive] = useState<Project>(PROJECTS[0]!);
  const [climb, setClimb] = useState(0);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [wallHeight, setWallHeight] = useState(0);
  const [zones, setZones] = useState<Zone[]>([]);

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
    const measure = () => {
      setWallHeight(el.scrollHeight);

      // Rectangles occupied by real content, in wall coordinates, so holds
      // can be scattered anywhere that isn't a section body.
      const wall = el.getBoundingClientRect();
      const next: Zone[] = Array.from(el.querySelectorAll<HTMLElement>("[data-body]")).map((b) => {
        const r = b.getBoundingClientRect();
        return {
          x0: (r.left - wall.left) / wall.width,
          x1: (r.right - wall.left) / wall.width,
          y0: wall.bottom - r.bottom,
          y1: wall.bottom - r.top,
        };
      });
      setZones(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    wallHeightRef.current = wallHeight;
  }, [wallHeight]);

  // Round so a resize by a few px doesn't reshuffle every hold on screen
  const holdLayout = useRef<ReturnType<typeof generateHolds>>([]);
  if (holdLayout.current.length === 0 && wallHeight > 0 && zones.length > 0) {
    holdLayout.current = generateHolds(Math.round(wallHeight / 50) * 50, zones);
  }
  const holds = holdLayout.current;

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

  // A controlled "fall" back to the bottom: let go, accelerate down under
  // gravity, then a small bounce as you land on the mat.
  const fallToBottom = () => {
    grip.current = null;
    vel.current = 0;
    const state = { v: climbRef.current };
    gsap.killTweensOf(state);
    const distance = climbRef.current;
    if (distance < 4) return;
    gsap
      .timeline()
      .to(state, {
        v: distance * 0.08,
        duration: Math.min(1.1, 0.35 + distance / 5000),
        ease: "power2.in",
        onUpdate: () => set(state.v),
      })
      .to(state, {
        v: 0,
        duration: 0.7,
        ease: "bounce.out",
        onUpdate: () => set(state.v),
      });
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
      <Analytics />
      <button
        onClick={fallToBottom}
        className="fixed top-6 right-6 z-50 rounded-full border border-border px-5 py-2 text-xs tracking-widest text-muted-foreground transition hover:border-warm hover:text-warm"
      >
        ↓ GO TO BOTTOM
      </button>


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
          >
            <span className="hold-bolt" aria-hidden />
          </button>
        ))}

        {/* sections, in climb order: intro, Projects (centre stage),
            then Skills / Interests / Contact alternating sides, and the
            copyright right at the top of the climb */}
        <IntroSection />

        <WallSection side="center" wide>
          <Reveal>
            <header className="mb-10 text-center">
              <span className="text-[0.6rem] tracking-[0.4em] text-warm uppercase">
                Selected work
              </span>
              <h2 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Projects</h2>
              <span className="mx-auto mt-5 block h-px w-20 bg-warm/50" />
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Spin the carousel to choose a project, then drag the photos downward to climb
                through its story.
              </p>
            </header>
          </Reveal>
          <div className="flex flex-col items-center gap-8">
            <ProjectGallery onSelect={setActive} />
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-border/70 bg-card/30 p-2 shadow-[0_30px_60px_-30px_oklch(0_0_0/80%)] backdrop-blur-sm">
                <ProjectStory project={active} />
              </div>
            </Reveal>
          </div>
        </WallSection>



        <WallSection side="right" wide>
          <Reveal>
            <h2 className="mb-3 text-3xl font-light">Skills</h2>
            <p className="mb-8 ml-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              A few tools and techniques I have picked up along the way. Drag each to cycle through my skills.
            </p>
            <SkillsBarrels />
          </Reveal>
        </WallSection>

        <WallSection side="left" wide>
          <Reveal>
            <InterestsSection />
          </Reveal>
        </WallSection>

        <WallSection side="right">
          <Reveal>
            <ContactSection />
          </Reveal>
        </WallSection>

        <SiteFooter />
      </div>

      <MountainProgress progress={p} />

      {/* desktop disclaimer */}
      <div className="pointer-events-none fixed bottom-6 right-6 max-w-[10rem] text-right text-[0.6rem] leading-relaxed tracking-[0.2em] text-muted-foreground/60 uppercase">
        Best on desktop — holds don&apos;t work on phones or iPads.
      </div>
    </main>
  );
}

function IntroSection() {
  return (
    <div className="relative z-20 flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center pointer-events-none">
      <div data-body className="pointer-events-auto flex flex-col items-center gap-6">
        <BenName />
        <p
          className="max-w-md text-sm tracking-[0.25em] text-muted-foreground"
          style={{ animation: "rise-in 900ms cubic-bezier(.16,1,.3,1) 140ms both" }}
        >
          Ben Baxandall — Design &amp; Engineering
        </p>
        <p
          className="max-w-xl text-base leading-relaxed text-muted-foreground"
          style={{ animation: "rise-in 900ms cubic-bezier(.16,1,.3,1) 560ms both" }}
        >
          An enthusiast in design, engineering and climbing. I love creating things that are both
          fun and functional.
        </p>
        <p
          className="mt-8 max-w-sm text-[0.65rem] leading-loose tracking-[0.3em] text-warm uppercase"
          style={{ animation: "breathe 3s ease-in-out infinite" }}
        >
          This page has no scrollbars to give the sense of a real climb. Pull the holds to scale the page.
        </p>
      </div>

    </div>
  );
}

// Places a section's content centrally or against the left/right edge of
// the wall. The section itself lets clicks pass through to the holds
// behind it; only the content block re-enables pointer events.
function WallSection({
  side,
  wide = false,
  children,
}: {
  side: "left" | "right" | "center";
  wide?: boolean;
  children: React.ReactNode;
}) {
  const align =
    side === "center"
      ? "mx-auto text-center"
      : side === "left"
        ? "mr-auto text-left"
        : "ml-auto text-right";

  return (
    <section className="relative z-20 flex min-h-screen w-full items-center px-6 py-24 pointer-events-none md:px-20">
      <div
        data-body
        className={`pointer-events-auto w-full ${wide ? "max-w-4xl" : "max-w-md"} ${align}`}
      >
        {children}
      </div>
    </section>
  );
}

function InterestsSection() {
  // Placeholder — swap these for your real interests
  const interests = ["Raspberry Pi", "3D Printing", "Animation", "Wild Swimming", "Football", "Running", "Cooking", "Guitar", "Reading"];
  const [drawnIndex, setDrawnIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDrawnIndex((drawnIndex + 1) % interests.length),
      4300,
    );
    return () => window.clearTimeout(timer);
  }, [drawnIndex, interests.length]);

  const selectInterest = (index: number) => {
    setDrawnIndex(index);
  };

  return (
    <div>
      <h2 className="mb-3 text-3xl font-light">Interests</h2>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        A few things I spend my time on outside of design and engineering — they shape how I approach problem solving. Click on one to see its animation.
      </p>
      <ul className="flex flex-wrap items-center gap-2">
        {interests.map((i) => (
          <li key={i} className="flex items-center gap-2">
            <button
              onClick={() => selectInterest(interests.indexOf(i))}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                drawnIndex === interests.indexOf(i)
                  ? "border-warm text-warm"
                  : "border-border text-muted-foreground hover:border-warm hover:text-warm"
              }`}
            >
              {i}
            </button>
            {drawnIndex === interests.indexOf(i) && <InterestDoodle key={`${i}-${drawnIndex}`} name={i} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-20 flex w-full flex-col items-center gap-2 px-6 pb-16 pt-8 text-center">
      <span className="block h-px w-16 bg-warm/40" />
      <p className="text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
        © {new Date().getFullYear()} Ben Baxandall. All rights reserved.
      </p>
    </footer>
  );
}


function ContactSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-light">Contact</h2>
      <p className="text-sm text-muted-foreground">Feel free to reach out or just say hello!</p>
      <a
        className="text-lg text-warm underline underline-offset-4"
        href="mailto:benbaxandall@btinternet.com"
      >
        benbaxandall@btinternet.com
      </a>
    </div>
  );
}