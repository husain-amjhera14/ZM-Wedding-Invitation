"use client";

interface LeafSpec {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  sway: number;
  variant: "a" | "b";
}

// Deterministic positions & timings so SSR and client match with zero hydration issues
const LEAVES: LeafSpec[] = [
  { id: 1, left: "5%", size: 11, duration: 13, delay: -2, opacity: 0.65, sway: 28, variant: "a" },
  { id: 2, left: "11%", size: 8, duration: 16, delay: -9, opacity: 0.5, sway: -24, variant: "b" },
  { id: 3, left: "16%", size: 13, duration: 12, delay: -5, opacity: 0.72, sway: 32, variant: "a" },
  { id: 4, left: "21%", size: 9, duration: 15, delay: -12, opacity: 0.48, sway: -20, variant: "b" },
  { id: 5, left: "26%", size: 12, duration: 14, delay: -3, opacity: 0.62, sway: 26, variant: "a" },
  { id: 6, left: "31%", size: 7, duration: 17, delay: -14, opacity: 0.42, sway: -18, variant: "b" },
  { id: 7, left: "38%", size: 10, duration: 13.5, delay: -7, opacity: 0.52, sway: 22, variant: "a" },
  { id: 8, left: "46%", size: 9, duration: 15.5, delay: -1, opacity: 0.45, sway: -26, variant: "b" },
  { id: 9, left: "55%", size: 11, duration: 14.5, delay: -10, opacity: 0.5, sway: 24, variant: "a" },
  { id: 10, left: "64%", size: 8, duration: 16.5, delay: -6, opacity: 0.45, sway: -22, variant: "b" },
  { id: 11, left: "70%", size: 12, duration: 12.5, delay: -11, opacity: 0.64, sway: 30, variant: "a" },
  { id: 12, left: "75%", size: 9, duration: 15, delay: -4, opacity: 0.52, sway: -25, variant: "b" },
  { id: 13, left: "80%", size: 13, duration: 13, delay: -8, opacity: 0.7, sway: 28, variant: "a" },
  { id: 14, left: "86%", size: 8, duration: 17, delay: -13, opacity: 0.46, sway: -20, variant: "b" },
  { id: 15, left: "91%", size: 11, duration: 11.8, delay: -2.5, opacity: 0.66, sway: 26, variant: "a" },
  { id: 16, left: "96%", size: 9, duration: 14.2, delay: -7.5, opacity: 0.55, sway: -22, variant: "b" },
  { id: 17, left: "14%", size: 10, duration: 18, delay: -15, opacity: 0.55, sway: 20, variant: "b" },
  { id: 18, left: "83%", size: 10, duration: 16, delay: -1.5, opacity: 0.58, sway: -28, variant: "a" },
];

export default function FallingLeaves() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-[12]"
    >
      {LEAVES.map((leaf) => (
        <span
          key={leaf.id}
          className={
            leaf.variant === "a" ? "falling-leaf-a" : "falling-leaf-b"
          }
          style={{
            left: leaf.left,
            width: `${leaf.size}px`,
            height: `${Math.round(leaf.size * 1.45)}px`,
            opacity: leaf.opacity,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            ["--leaf-sway" as string]: `${leaf.sway}px`,
          }}
        >
          <svg
            viewBox="0 0 14 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_1px_3px_rgba(245,207,123,0.22)]"
          >
            <path
              d="M7 0.5C10.8 4.2 13 8.6 13 12.6C13 16.4 10.3 19.2 7 19.5C3.7 19.2 1 16.4 1 12.6C1 8.6 3.2 4.2 7 0.5Z"
              fill={leaf.variant === "a" ? "#d9b468" : "#c59a4a"}
            />
            <path
              d="M7 2.5V17.5"
              stroke="#f5dfab"
              strokeOpacity="0.45"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
