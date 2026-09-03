import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./ProjectGallery.css";

export type Project = {
  id: string;
  title: string;
  thumb: string; // square image
  description: string;
  images: string[]; // full story photos, natural aspect ratio
};

// Swap in your real projects (drop images in /public and reference them as "/elec/PID.png")
export const PROJECTS: Project[] = [
  { id: "p1", title: "PID Ball Balance", thumb: "/elec/PID.png", description: "The objective in this project was to investigate PID systems, as control loops were not covered in detail in my degree. The idea was to create a PID system which learns to balance a ball on a small rail. From some initial sketches and learning about the uses of PID, I created a control loop diagram to guide the programming process. A prototype was created using an ultrasonic sensor to calculate where  the ball was and a servo to tilt the rail. Using iterative design, I altered the PID constants and sent them through the Arduino until the system was optimised. With the serial plotter on the arduino, I could calibrate the ultrasonic sensor to ensure correct measurements. ", images: ["/elec/PID.png"] },
  { id: "p2", title: "Dodgy Ballers Kit", thumb: "/kit/k2.png", description: "As kit and equipment secretary of the University Dodgeball team, I designed the team kit with professional supplier, Scimitar. Through iterative design and team feedback, I developed a kit tailored to the team, while also strengthening my design skills, especially within Canva.", images: ["/kit/k1.png", "/kit/k3.png", "/kit/k4.png"] },
  { id: "p3", title: "Web Design", thumb: "/elec/PID.png", description: "Following my commitment to the wild swimming society, I have been strengthening my software development and Git skills by creating a website for users to log their swims, using APIs such as Leaflet and Supabase. I started with sketches to review what I wanted before prompting Lovable. Whilst bolstering my UI and UX design experience, I presented a few users with the initial layout. The feedback included creating a hidable tab for the swims to clean up the aesthetics and to lighten the map as it was difficult to see. This project strengthened my use of AI workflows and databases.", images: ["/elec/PID.png"] },
  { id: "p4", title: "Animations", thumb: "/anim/a4.png", description: "Following an early passion for stop-motion, I have developed my animation skills within Blender, which has complemented my 3D modelling experience in Fusion. This has strengthened my ability to adapt to new creative software quickly.", images: ["/anim/a1.gif", "/anim/a2.gif", "/anim/a3.gif"] },
  { id: "p5", title: "Climbing Board", thumb: "/dt/d2.png", description: "Following my love of climbing, I designed and branded a climbing board for my Design Technology coursework. Largely focused on iterative design, the project introduced me to a range of different design software for laser cutting, CNC routing and 3D printing. It also developed my drawing skills and user-centred design through stakeholder feedback. ", images: ["/dt/d1.png", "/dt/d5.png", "/dt/d3.png", "/dt/d4.png"] },
  { id: "p6", title: "Video Editing", thumb: "/elec/PID.png", description: "Over the past few years, I have thoroughly enjoyed expressing my creativity through video edits. It has been great to get hands-on experience with editing software and has allowed me to . I have also produced a few videos for the Dodgy Ballers, a University football club, where understanding the target audience was key and I learnt skills such as motion branding.", images: ["/elec/PID.png"] },
];

const RADIUS = 280; // enough depth for the rear cards to remain visible around the cylinder
const AUTO_SPEED = 4; // degrees per second while idle
const DRAG_DEG_PER_PX = 0.25;
const RESUME_DELAY_MS = 1200;
// Cards all sit on one level ring — no vertical stagger.

/**
 * A 3D spiral carousel: cards sit on the surface of a cylinder, each one
 * risen slightly higher than the last, and the whole thing is viewed from
 * an angled-down perspective so it reads as a spiral staircase rather than
 * a flat ring. Cards on the far side naturally show their mirrored back —
 * that's just CSS's default backface behaviour, left untouched on purpose.
 */
export default function ProjectGallery({
  onSelect,
  autoSpinPaused = false,
}: {
  onSelect: (project: Project) => void;
  /** Pass true while something else (e.g. the story panel below) is being dragged,
   *  so the ring doesn't keep reassigning the active project mid-gesture. */
  autoSpinPaused?: boolean;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotation = useRef(0); // degrees, grows/shrinks without limit
  const drag = useRef({ active: false, startX: 0, startRot: 0 });
  const resumeAt = useRef(0);
  const lastIndex = useRef(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  const n = PROJECTS.length;
  const step = 360 / n;

  const render = () => {
    const ring = ringRef.current;
    if (!ring) return;
    gsap.set(ring, { rotationY: rotation.current });

    // Fade/dim the cards facing away so the ring reads as depth, not clutter.
    // This must use the SAME angle formula as each card's own base rotation
    // below, or the "front" the math thinks it sees won't match what's
    // actually rendered facing the camera.
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const angle = ((i * step + rotation.current) % 360 + 360) % 360;
      const facing = Math.cos((angle * Math.PI) / 180); // 1 = front, -1 = back
      gsap.set(el, {
        opacity: gsap.utils.clamp(0.25, 1, 0.35 + facing * 0.75), // raised the floor so back cards stay visible/legible, just dimmer
        filter: `brightness(${gsap.utils.clamp(0.4, 1.1, 0.55 + facing * 0.55)})`,
      });
    });

    const idx = gsap.utils.wrap(0, n, Math.round(-rotation.current / step));
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      setActiveIndex(idx);
      onSelect(PROJECTS[idx]!);
    }
  };

  useLayoutEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (el)
        gsap.set(el, {
          rotationY: i * step,
          z: RADIUS,
          y: 0,
          transformOrigin: `50% 50% ${-RADIUS}px`,
        });
    });
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle auto-spin — now also respects the externally-controlled pause
  useEffect(() => {
    const tick = () => {
      if (!drag.current.active && !autoSpinPaused && performance.now() >= resumeAt.current) {
        rotation.current -= (AUTO_SPEED * (gsap.ticker.deltaRatio() * 1)) / 60;
        render();
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpinPaused]);

  const snap = () => {
    const target = Math.round(rotation.current / step) * step;
    gsap.to(rotation, {
      current: target,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: render,
      onComplete: render,
    });
    resumeAt.current = performance.now() + RESUME_DELAY_MS;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    gsap.killTweensOf(rotation);
    drag.current = { active: true, startX: e.clientX, startRot: rotation.current };
    setGrabbing(true);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    rotation.current = drag.current.startRot + (e.clientX - drag.current.startX) * DRAG_DEG_PER_PX;
    render();
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setGrabbing(false);
    snap();
  };

  const goTo = (i: number) => {
    gsap.killTweensOf(rotation);
    const current = rotation.current;
    const target = -i * step;
    // take the shortest way round the ring
    const delta = ((target - current + 180) % 360 + 360) % 360 - 180;
    gsap.to(rotation, {
      current: current + delta,
      duration: 1,
      ease: "power3.inOut",
      onUpdate: render,
      onComplete: render,
    });
    resumeAt.current = performance.now() + RESUME_DELAY_MS;
  };

  return (
    <div className="carousel">
      <div
        className="carousel-stage"
        style={{ cursor: grabbing ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Static tilt so we're looking down into the spiral. The ring inside
            still spins freely on its own rotationY, independent of this. */}
        <div className="carousel-tilt">
          <div className="carousel-ring" ref={ringRef}>
            {PROJECTS.map((project, i) => (
              <div
                key={project.id}
                className={`carousel-card ${i === activeIndex ? "is-active" : ""}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => goTo(i)}
              >
                <img src={project.thumb} alt={project.title} loading="lazy" />
                <span className="carousel-card-title">{project.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="carousel-dots">
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            aria-label={`Show ${p.title}`}
            className={i === activeIndex ? "is-active" : ""}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      <p className="carousel-hint">drag to spin</p>
    </div>
  );
}