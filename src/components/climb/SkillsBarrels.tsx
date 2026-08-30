import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./SkillsBarrels.css";

const SKILLS: Record<string, string[]> = {
  Engineering: [
    "Fusion",
    "SolidWorks",
    "Laser Cutting",
    "CNC Routing",
    "Project Management",
    "Stakeholder Feedback Analysis",
    "Iterative Design",
    "UCD",
  ],
  Electronics: [
    "Arduino",
    "Raspberry Pi",
    "Soldering",
    "Motor Driving",
    "Sensor Integration",
    "LT Spice",
    "FPGA Development",
  ],
  Programming: ["C++", "C#", "GitHub", "OpenCV", "Python", "Verilog", "MATLAB", "React"],
  
  Creative: ["Blender", "Filmora", "Canva", "3D Printing", "Cura Slicer", "UI / UX"],
};

const RADIUS = 80; // how far items sit from the barrel's centre axis
const DRAG_SENSITIVITY = 0.6; // degrees of rotation per pixel dragged

function Barrel({ title, items }: { title: string; items: string[] }) {
  const barrelRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef(0);
  const dragState = useRef({ dragging: false, startY: 0, startSpin: 0 });
  const [frontIndex, setFrontIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const angle = 360 / items.length;

  // Position every skill around the drum once, before first paint
  useLayoutEffect(() => {
    if (!barrelRef.current) return;
    const children = gsap.utils.toArray<HTMLElement>(barrelRef.current.children);
    children.forEach((el, i) => {
      gsap.set(el, { rotationX: i * angle, z: RADIUS });
    });
    gsap.set(barrelRef.current, { rotationX: 0 });
    spinRef.current = 0;
  }, [items, angle]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { dragging: true, startY: e.clientY, startSpin: spinRef.current };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging || !barrelRef.current) return;
    const deltaY = e.clientY - dragState.current.startY;
    const newSpin = dragState.current.startSpin + deltaY * DRAG_SENSITIVITY;
    spinRef.current = newSpin;
    gsap.set(barrelRef.current, { rotationX: newSpin });
  };

  const onPointerUp = () => {
    if (!dragState.current.dragging || !barrelRef.current) return;
    dragState.current.dragging = false;
    setIsDragging(false);

    // Snap to the nearest full step so a skill always lands facing front
    const snapped = Math.round(spinRef.current / angle) * angle;
    spinRef.current = snapped;
    gsap.to(barrelRef.current, {
      rotationX: snapped,
      duration: 0.6,
      ease: "elastic.out(1, 0.6)",
    });

    const idx = (((Math.round(-snapped / angle)) % items.length) + items.length) % items.length;
    setFrontIndex(idx);
  };

  return (
    <div className="skill-barrel">
      <h3>{title}</h3>

      <div
        className="barrel-window"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <div ref={barrelRef} className="barrel">
          {items.map((skill, i) => (
            <div key={skill} className={`skill ${i === frontIndex ? "skill-active" : ""}`}>
              {skill}
            </div>
          ))}
        </div>
      </div>

      <p className="barrel-hint">drag to cycle</p>
    </div>
  );
}

export default function SkillsBarrels() {
  return (
    <div className="skills-barrels">
      {Object.entries(SKILLS).map(([title, items]) => (
        <Barrel key={title} title={title} items={items} />
      ))}
    </div>
  );
}