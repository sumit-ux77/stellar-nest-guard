import { motion } from "framer-motion";

type Props = {
  mood?: "idle" | "alert" | "happy" | "thinking";
  size?: number;
};

/**
 * Atlas — a mechanical brass-and-midnight owl. SVG so it scales crisply.
 * Moods drive subtle expression changes (head tilt, eye state).
 */
export function AtlasOwl({ mood = "idle", size = 180 }: Props) {
  const tilt = mood === "alert" ? -8 : mood === "thinking" ? 6 : 0;
  const eyeScale = mood === "happy" ? 0.15 : 1;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="drop-shadow-[0_8px_24px_oklch(0.78_0.13_80/0.25)]"
    >
      <defs>
        <radialGradient id="brass-grad" cx="0.4" cy="0.35">
          <stop offset="0%" stopColor="oklch(0.88 0.13 85)" />
          <stop offset="60%" stopColor="oklch(0.72 0.13 75)" />
          <stop offset="100%" stopColor="oklch(0.42 0.10 60)" />
        </radialGradient>
        <radialGradient id="body-grad" cx="0.4" cy="0.4">
          <stop offset="0%" stopColor="oklch(0.32 0.06 265)" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 265)" />
        </radialGradient>
        <radialGradient id="eye-grad" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="oklch(0.95 0.15 85)" />
          <stop offset="100%" stopColor="oklch(0.65 0.15 70)" />
        </radialGradient>
      </defs>

      {/* halo */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="url(#brass-grad)" strokeWidth="0.5" opacity="0.4" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="url(#brass-grad)" strokeWidth="0.3" opacity="0.25" />

      {/* body */}
      <ellipse cx="100" cy="125" rx="55" ry="55" fill="url(#body-grad)" stroke="url(#brass-grad)" strokeWidth="1.5" />
      {/* chest plate */}
      <path d="M 70 130 Q 100 110 130 130 Q 130 165 100 175 Q 70 165 70 130 Z" fill="oklch(0.20 0.05 265)" stroke="url(#brass-grad)" strokeWidth="0.8" />
      <line x1="100" y1="118" x2="100" y2="172" stroke="url(#brass-grad)" strokeWidth="0.6" opacity="0.6" />
      {/* rivets */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={`r-l-${i}`} cx={78} cy={130 + i * 12} r="1.2" fill="url(#brass-grad)" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={`r-r-${i}`} cx={122} cy={130 + i * 12} r="1.2" fill="url(#brass-grad)" />
      ))}

      {/* head */}
      <g style={{ transformOrigin: "100px 80px" }}>
        <ellipse cx="100" cy="80" rx="48" ry="44" fill="url(#body-grad)" stroke="url(#brass-grad)" strokeWidth="1.5" />
        {/* ear tufts */}
        <path d="M 62 50 L 70 68 L 78 52 Z" fill="url(#body-grad)" stroke="url(#brass-grad)" strokeWidth="1" />
        <path d="M 138 50 L 130 68 L 122 52 Z" fill="url(#body-grad)" stroke="url(#brass-grad)" strokeWidth="1" />
        {/* facial disc */}
        <ellipse cx="82" cy="82" rx="22" ry="26" fill="oklch(0.22 0.05 265)" stroke="url(#brass-grad)" strokeWidth="0.8" />
        <ellipse cx="118" cy="82" rx="22" ry="26" fill="oklch(0.22 0.05 265)" stroke="url(#brass-grad)" strokeWidth="0.8" />
        {/* monocle on right eye */}
        <circle cx="118" cy="82" r="14" fill="none" stroke="url(#brass-grad)" strokeWidth="2" />
        <line x1="132" y1="82" x2="142" y2="92" stroke="url(#brass-grad)" strokeWidth="1.2" />
        {/* eyes */}
        <g className={mood === "idle" ? "animate-blink" : ""} style={{ transformOrigin: "82px 82px" }}>
          <circle cx="82" cy="82" r={9 * eyeScale + (eyeScale === 1 ? 0 : 0)} fill="url(#eye-grad)" />
          <circle cx="84" cy="80" r={3 * eyeScale} fill="oklch(0.10 0.03 265)" />
        </g>
        <g style={{ transformOrigin: "118px 82px" }}>
          <circle cx="118" cy="82" r={9 * eyeScale} fill="url(#eye-grad)" />
          <circle cx="120" cy="80" r={3 * eyeScale} fill="oklch(0.10 0.03 265)" />
        </g>
        {/* beak */}
        <path d="M 95 95 L 100 108 L 105 95 Z" fill="url(#brass-grad)" stroke="oklch(0.42 0.10 60)" strokeWidth="0.6" />
      </g>

      {/* gear on chest */}
      <g className="animate-gear" style={{ transformOrigin: "100px 145px" }}>
        <circle cx="100" cy="145" r="9" fill="url(#brass-grad)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect
            key={a}
            x="98.5"
            y="133"
            width="3"
            height="4"
            fill="url(#brass-grad)"
            transform={`rotate(${a} 100 145)`}
          />
        ))}
        <circle cx="100" cy="145" r="3" fill="oklch(0.14 0.04 265)" />
      </g>
    </motion.svg>
  );
}
