export type Puff = {
  id: number;
  left: string;
  bottom: number;
  seed: number;
};

/** A burst of chalk dust left behind on a hold that was grabbed. */
export function ChalkPuff({ puff }: { puff: Puff }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: puff.left, bottom: puff.bottom }}
      aria-hidden
    >
      <div
        className="absolute h-10 w-10 rounded-full bg-chalk/30 blur-md"
        style={{
          transform: "translate(-50%, 50%)",
          animation: "chalk-cloud 1400ms ease-out forwards",
        }}
      />
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * Math.PI * 2 + puff.seed;
        const dist = 22 + ((puff.seed * (i + 3)) % 1) * 26;
        return (
          <span
            key={i}
            className="absolute block rounded-full bg-chalk"
            style={
              {
                width: 3 + (i % 3),
                height: 3 + (i % 3),
                transform: "translate(-50%, 50%)",
                "--dx": `${Math.cos(ang) * dist}px`,
                "--dy": `${-Math.abs(Math.sin(ang)) * dist - 10}px`,
                animation: `chalk-particle ${1100 + i * 70}ms cubic-bezier(.2,.7,.3,1) forwards`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
