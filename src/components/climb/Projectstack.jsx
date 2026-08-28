import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import './ProjectStack.css';

const projects = [
  {
    title: 'Dodgy Ballers',
    image: '/public/DodgyBallers.JPEG',
    description: 'A social platform for discovering wild swimming spots.',
  },
  {
    title: 'Electronics',
    image: '/public/Electronics.png',
    description: 'A 3D-printed drawing machine using stepper motors.',
  },
  {
    title: 'PID Design',
    image: '/public/PID.png',
    description: 'A Raspberry Pi computer vision project using OpenCV.',
  },
  {
    title: 'Lake it or leave it',
    image: '/public/WebDesign.png',
    description: 'A compact hand-powered generator designed from scratch.',
  },
];

export default function ProjectStack() {
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const start = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    start.current = {
      x: e.clientX,
      y: e.clientY,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    // Pull down → open project
    if (dy < -80) {
      setFocused(true);
      return;
    }

    // Pull left/right → change project
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        setActive((prev) => (prev + 1) % projects.length);
      } else {
        setActive(
          (prev) => (prev - 1 + projects.length) % projects.length
        );
      }
    }
  };

  const handleCardClick = (index) => {
    setActive(index);
    setFocused(true);
  };

  return (
    <section className={`project-section ${focused ? 'focused' : ''}`}>
      {!focused ? (
        <div
          className="project-stack"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {projects.map((project, index) => {
            const offset = index - active;

            return (
              <article
                key={project.title}
                className={`project-card ${
                  index === active ? 'active' : ''
                }`}
                style={{
                  '--offset': offset,
                  '--z': index === active ? 40 : 10 - Math.abs(offset) * 5,
                }}
                onClick={() => handleCardClick(index)}
              >
                <img src={project.image} alt="" />

                <div className="project-label">
                  <span>{project.title}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <ProjectDetail
          project={projects[active]}
          onBack={() => setFocused(false)}
        />
      )}

      {!focused && (
        <div className="project-hint">
          <span>← drag →</span>
          <span>↓ pull to explore</span>
        </div>
      )}
    </section>
  );
}

function ProjectDetail({ project, onBack }) {
  return (
    <div className="project-detail">
      <button className="project-back" onClick={onBack}>
        ← Back
      </button>

      <img src={project.image} alt="" />

      <div className="project-detail-content">
        <h1>{project.title}</h1>
        <p>{project.description}</p>

        <div className="project-long-content">
          <p>
            This is where you can put the full project story, design
            process, sketches, development, technical details and
            final outcome.
          </p>

          <div className="project-placeholder" />
          <div className="project-placeholder" />
        </div>
      </div>
    </div>
  );
}