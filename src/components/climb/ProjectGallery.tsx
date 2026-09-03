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

export const PROJECTS: Project[] = [
  { id: "p1", title: "PID Ball Balance", thumb: "/elec/e1.png", description: "The objective in this project was to investigate PID systems, as control loops were not covered in detail in my degree. The idea was to create a PID system which learns to balance a ball on a small rail. From some initial sketches and learning about the uses of PID, I created a control loop diagram to guide the programming process. A prototype was created using an ultrasonic sensor to calculate where  the ball was and a servo to tilt the rail. Using iterative design, I altered the PID constants and sent them through the Arduino until the system was optimised. With the serial plotter on the arduino, I could calibrate the ultrasonic sensor to ensure correct measurements. ", images: ["/elec/e2.png", "/elec/e3.png", "/elec/e4.png"] },
  { id: "p2", title: "Dodgy Ballers Kit", thumb: "/kit/k2.png", description: "As kit and equipment secretary of the University Dodgeball team, I designed the team kit with professional supplier, Scimitar. Through iterative design and team feedback, I developed a kit tailored to the team, while also strengthening my design skills, especially within Canva.", images: ["/kit/k1.png", "/kit/k3.png", "/kit/k4.png"] },
  { id: "p3", title: "Web Design", thumb: "/web/w1.png", description: "Following my commitment to the wild swimming society, I have been strengthening my software development and Git skills by creating a website for users to log their swims, using APIs such as Leaflet and Supabase. I started with sketches to review what I wanted before prompting Lovable. Whilst bolstering my UI and UX design experience, I presented a few users with the initial layout. The feedback included creating a hidable tab for the swims to clean up the aesthetics and to lighten the map as it was difficult to see. This project strengthened my use of AI workflows and databases.", images: ["/web/w2.png", "/web/w3.png"] },
  { id: "p4", title: "Animations", thumb: "/anim/a4.png", description: "Following an early passion for stop-motion, I have developed my animation skills within Blender, which has complemented my 3D modelling experience in Fusion. This has strengthened my ability to adapt to new creative software quickly.", images: ["/anim/a1.gif", "/anim/a2.gif", "/anim/a3.gif"] },
  { id: "p5", title: "Climbing Board", thumb: "/dt/d2.png", description: "Following my love of climbing, I designed and branded a climbing board for my Design Technology coursework. Largely focused on iterative design, the project introduced me to a range of different design software for laser cutting, CNC routing and 3D printing. It also developed my drawing skills and user-centred design through stakeholder feedback. ", images: ["/dt/d1.png", "/dt/d5.png", "/dt/d3.png", "/dt/d4.png"] },
  { id: "p6", title: "Video Editing", thumb: "/vid/v2.png", description: "Over the past few years, I have thoroughly enjoyed expressing my creativity through video edits. It has been great to get hands-on experience with editing software and has allowed me to . I have also produced a few videos for the Dodgy Ballers, a University football club, where understanding the target audience was key and I learnt skills such as motion branding.", images: ["/vid/v1.png", "/vid/v3.png", "/vid/v4.png"] },
];

const RADIUS = 280; // enough depth for the rear cards to remain visible around the cylinder
const AUTO_SPEED = 0; // idle auto-spin disabled so projects stay readable
const DRAG_DEG_PER_PX = 0.25;
const RESUME_DELAY_MS = 1200;
const FLING_FACTOR = 5.5; // how much release velocity carries the spin onward before it snaps

export default function ProjectGallery({
  onSelect,
  autoSpinPaused = false,
}: {
  onSelect: (project: Project) => void;
  autoSpinPaused?: boolean;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotation = useRef(0);
  const drag = useRef({ active: false, startY: 0, startRot: 0, lastY: 0, lastT: 0, velocity: 0 });
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

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const angle = ((i * step + rotation.current) % 360 + 360) % 360;
      const facing = Math.cos((angle * Math.PI) / 180); // 1 = front, -1 = back
      const isActive = i === activeIndex;
      gsap.set(el, {
        opacity: gsap.utils.clamp(0.25, 1, 0.35 + facing * 0.75),
        filter: `brightness(${gsap.utils.clamp(0.4, 1.1, 0.55 + facing * 0.55)})`,
        // small lift + scale on whichever card is currently front-and-centre,
        // so it reads as "selected" rather than just brighter
        scale: isActive ? 1.08 : 1,
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

  useEffect(() => {
    if (AUTO_SPEED === 0 || autoSpinPaused) return;
    const tick = () => {
      if (!drag.current.active && performance.now() >= resumeAt.current) {
        rotation.current -= (AUTO_SPEED * gsap.ticker.deltaRatio()) / 60;
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
    const now = performance.now();
    drag.current = { active: true, startY: e.clientY, startRot: rotation.current, lastY: e.clientY, lastT: now, velocity: 0 };
    setGrabbing(true);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const now = performance.now();
    const dt = Math.max(now - drag.current.lastT, 1);

    // pulling DOWN spins the ring forward — matches the pull-to-explore
    // gesture used everywhere else on the site
    rotation.current = drag.current.startRot + (e.clientY - drag.current.startY) * DRAG_DEG_PER_PX;

    drag.current.velocity = ((e.clientY - drag.current.lastY) * DRAG_DEG_PER_PX) / dt; // deg per ms
    drag.current.lastY = e.clientY;
    drag.current.lastT = now;

    render();
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setGrabbing(false);
    // carry a bit of the release velocity onward before settling — gives it
    // some weight/momentum instead of stopping dead where you let go
    rotation.current += drag.current.velocity * FLING_FACTOR * 16;
    snap();
  };

  const goTo = (i: number) => {
    gsap.killTweensOf(rotation);
    const current = rotation.current;
    const target = -i * step;
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
      <p className="carousel-hint">↓ pull down to browse</p>
    </div>
  );
}