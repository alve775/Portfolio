type Intensity = 'soft' | 'strong';

function createStars(intensity: Intensity) {
  let seed = 11;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: intensity === 'soft' ? 40 : 34 }, (_, index) => ({
    id: index,
    x: (next() * 100).toFixed(1),
    y: (next() * 100).toFixed(1),
    size: next() < 0.8 ? 2 : 3,
    duration: ((intensity === 'soft' ? 3 : 2.5) + next() * 3).toFixed(1),
    delay: (next() * 4).toFixed(1),
  }));
}

const fields = { soft: createStars('soft'), strong: createStars('strong') };

/** Seeded once per module; this decorative field needs no client JavaScript. */
export function Starfield({ intensity = 'soft' }: { intensity?: Intensity }) {
  return (
    <div className={`starfield starfield-${intensity}`} aria-hidden="true">
      {fields[intensity].map(({ id, x, y, size, duration, delay }) => (
        <span
          key={id}
          className="starfield-star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
