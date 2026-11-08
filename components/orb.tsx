"use client";
import { useEffect, useRef } from "react";

type P = { x: number; y: number; z: number };

const COUNT = 760;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const TILT = 0.42;
const CT = Math.cos(TILT);
const ST = Math.sin(TILT);

const SPHERE: P[] = Array.from({ length: COUNT }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / COUNT;
  const r = Math.sqrt(1 - y * y);
  const a = i * GOLDEN;
  return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
});

const unit = (x: number, y: number, z: number): P => {
  const l = Math.hypot(x, y, z);
  return { x: x / l, y: y / l, z: z / l };
};

const OUTLIERS: { p: P; r: number }[] = [
  { p: unit(0.8, 0.5, 0.3), r: 1.36 },
  { p: unit(-0.9, -0.3, 0.5), r: 1.22 },
  { p: unit(0.2, -0.9, 0.4), r: 1.4 },
  { p: unit(-0.4, 0.8, -0.5), r: 1.28 },
];

const CORAL = "#ff6b6b";

function rotate(p: P, a: number): P {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const x1 = p.x * ca + p.z * sa;
  const z1 = -p.x * sa + p.z * ca;
  return { x: x1, y: p.y * CT - z1 * ST, z: p.y * ST + z1 * CT };
}

export function Orb() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let size = 0;
    let raf = 0;
    let start = 0;
    let visible = true;

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const R = size / 3.2;
      const c = size / 2;
      const rad = R * 0.92;
      const k = Math.max(0.8, R / 150);
      const a = t * 0.18 + 0.6;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      ctx.clearRect(0, 0, size, size);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e8eefc";

      for (const p of SPHERE) {
        const x1 = p.x * ca + p.z * sa;
        const z1 = -p.x * sa + p.z * ca;
        const y2 = p.y * CT - z1 * ST;
        const z2 = p.y * ST + z1 * CT;
        const depth = (z2 + 1) / 2;
        const s = (0.6 + 1.1 * depth) * k;
        ctx.globalAlpha = 0.08 + 0.92 * Math.pow(depth, 2.2);
        ctx.fillRect(c + x1 * rad - s / 2, c + y2 * rad - s / 2, s, s);
      }
      ctx.globalAlpha = 1;

      OUTLIERS.forEach((o, i) => {
        const q = rotate(o.p, a * 0.55 + i);
        const px = c + q.x * R * o.r;
        const py = c + q.y * R * o.r;
        const sx = c + q.x * rad;
        const sy = c + q.y * rad;
        const d = 3.5 * k;

        ctx.globalAlpha = q.z > -0.2 ? 1 : 0.45;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,107,107,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = CORAL;
        ctx.shadowColor = "rgba(255,107,107,0.8)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(px, py - d);
        ctx.lineTo(px + d, py);
        ctx.lineTo(px, py + d);
        ctx.lineTo(px - d, py);
        ctx.closePath();
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const frame = (now: number) => {
      if (!start) start = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        draw(0);
        return;
      }
      if (visible) raf = requestAnimationFrame(frame);
    };

    measure();
    play();

    const ro = new ResizeObserver(() => {
      measure();
      if (reduce.matches) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) play();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    reduce.addEventListener("change", play);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduce.removeEventListener("change", play);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 size-[160%] -translate-x-1/2 -translate-y-1/2"
    />
  );
}