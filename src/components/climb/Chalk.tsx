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
      {/* Main chalk cloud */}
      <div
        className="absolute h-14 w-14 rounded-full bg-chalk/25 blur-lg"
        style={{
          transform: "translate(-50%, 50%)",
          animation: "chalk-cloud 1200ms ease-out forwards",
        }}
      />

      {/* Smaller clouds */}
      <div
        className="absolute h-8 w-8 rounded-full bg-chalk/20 blur-md"
        style={{
          transform: "translate(-80%, 20%)",
          animation: "chalk-cloud 1000ms ease-out 40ms forwards",
        }}
      />

      <div
        className="absolute h-6 w-6 rounded-full bg-chalk/20 blur-md"
        style={{
          transform: "translate(20%, 10%)",
          animation: "chalk-cloud 900ms ease-out 80ms forwards",
        }}
      />

      {/* Individual chalk particles */}
      {Array.from({ length: 16 }, (_, i) => {
        const ang =
          (i / 16) * Math.PI * 2 +
          puff.seed +
          (Math.random() - 0.5) * 0.5;

        const dist = 20 + Math.random() * 45;
        const size = 2 + Math.random() * 4;

        return (
          <span
            key={i}
            className="absolute block rounded-full bg-chalk"
            style={
              {
                width: size,
                height: size,
                opacity: 0.5 + Math.random() * 0.5,
                transform: "translate(-50%, 50%)",
                "--dx": `${Math.cos(ang) * dist}px`,
                "--dy": `${-Math.abs(Math.sin(ang)) * dist - 8}px`,
                animation: `chalk-particle ${
                  700 + Math.random() * 700
                }ms cubic-bezier(.2,.7,.3,1) forwards`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
