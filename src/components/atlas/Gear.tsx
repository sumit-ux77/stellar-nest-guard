type Props = {
  size?: number;
  teeth?: number;
  className?: string;
  color?: string;
};

export function Gear({ size = 80, teeth = 12, className = "", color = "url(#gear-brass)" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;
  const toothW = (size * 0.06);
  const toothH = size * 0.1;
  const items = Array.from({ length: teeth }, (_, i) => (i * 360) / teeth);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <defs>
        <radialGradient id="gear-brass" cx="0.4" cy="0.4">
          <stop offset="0%" stopColor="oklch(0.85 0.13 85)" />
          <stop offset="100%" stopColor="oklch(0.45 0.10 65)" />
        </radialGradient>
      </defs>
      {items.map((a) => (
        <rect
          key={a}
          x={cx - toothW / 2}
          y={cy - r - toothH}
          width={toothW}
          height={toothH}
          fill={color}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="oklch(0.14 0.04 265)" />
    </svg>
  );
}
