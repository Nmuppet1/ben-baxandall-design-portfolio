import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const skills = {
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
  Programming: [
    "C ++",
    "C#",
    "GitHub",
    "OpenCV",
    "Python",
    "Verilog",
    "MATLAB",
    "React",
  ],
  Creative: [
    "Blender",
    "Filmora",
    "Canva",
    "3D Printing",
    "Cura Slicer",
    "UI / UX",
  ],

};

function Barrel({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const barrelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barrelRef.current) return;

    const items = gsap.utils.toArray<HTMLElement>(
      barrelRef.current.children
    );

    const radius = 80;
    const angle = 360 / items.length;

    items.forEach((item, i) => {
      gsap.set(item, {
        rotationX: i * angle,
        z: radius,
        transformOrigin: "center center",
      });
    });

    const timeline = gsap.timeline({
      repeat: -1,
    });

    timeline.to(barrelRef.current, {
      rotationX: -angle,
      duration: 1,
      ease: "power2.inOut",
      repeat: -1,
    });

    return () => {
    timeline.kill();
  };
}, [items]);

  return (
    <div className="skill-barrel">
      <h3>{title}</h3>

      <div className="barrel-window">
        <div
          ref={barrelRef}
          className="barrel"
        >
          {items.map((skill) => (
            <div
              key={skill}
              className="skill"
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SkillsBarrels() {
  return (
    <div className="skills-barrels">
      {Object.entries(skills).map(([title, items]) => (
        <Barrel
          key={title}
          title={title}
          items={items}
        />
      ))}
    </div>
  );
}