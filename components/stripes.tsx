"use client";
import { useEffect, useRef, type RefObject } from "react";

type Stripe = {
  rgb: string;
  side: -1 | 1;
  far: number;
  near: number;
  amp: number;
  k: number;
  w: number;
  phase: number;
  delay: number;
};

const SKY = "56,189,248";
const TEAL = "45,212,191";
const BLUE = "79,124,255";
const INDIGO = "124,108,255";
const VIOLET = "180,108,245";
const ROSE = "228,107,208";
const CORAL = "255,107,107";

const STRIPES: Stripe[] = [
  { rgb: SKY, side: -1, far: -0.21, near: -0.5, amp: 0.07, k: 1.2, w: 0.26, phase: 0.3, delay: 0.1 },
  { rgb: ROSE, side: -1, far: -0.11, near: -0.25, amp: 0.055, k: 1.7, w: 0.36, phase: 2.4, delay: 0.2 },
  { rgb: INDIGO, side: -1, far: -0.01, near: 0.0, amp: 0.075, k: 1.0, w: 0.22, phase: 4.1, delay: 0.3 },
  { rgb: BLUE, side: -1, far: 0.09, near: 0.25, amp: 0.05, k: 1.9, w: 0.3, phase: 1.1, delay: 0.4 },
  { rgb: TEAL, side: -1, far: 0.19, near: 0.5, amp: 0.065, k: 1.4, w: 0.28, phase: 5.2, delay: 0.5 },

  { rgb: BLUE, side: 1, far: -0.2, near: -0.5, amp: 0.06, k: 1.5, w: 0.24, phase: 3.3, delay: 0.15 },
  { rgb: VIOLET, side: 1, far: -0.1, near: -0.25, amp: 0.07, k: 1.1, w: 0.32, phase: 0.8, delay: 0.25 },
  { rgb: TEAL, side: 1, far: 0.0, near: 0.0, amp: 0.05, k: 1.9, w: 0.18, phase: 4.6, delay: 0.35 },
  { rgb: CORAL, side: 1, far: 0.1, near: 0.25, amp: 0.065, k: 1.3, w: 0.22, phase: 2.0, delay: 0.45 },
  { rgb: INDIGO, side: 1, far: 0.2, near: 0.5, amp: 0.055, k: 1.7, w: 0.3, phase: 5.9, delay: 0.55 },
];

const TAU = Math.PI * 2;
const INTRO = 1.8;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export function Stripes({ orbRef }: { orbRef: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const orb = orbRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !orb || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    let n = 150;
    let glow = 14;
    let raf = 0;
    let start = 0;
    let visible = true;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const o = orb.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = o.left - rect.left + o.width / 2;
      cy = o.top - rect.top + o.height / 2;
      R = orb.offsetWidth / 2;
      n = w < 700 ? 90 : 150;
      glow = w < 700 ? 8 : 14;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (const s of STRIPES) {
        const p = reduce.matches ? 1 : easeOut(clamp01((t - s.delay) / INTRO));
        if (p <= 0) continue;

        const vis = p * 1.16;
        const last = Math.min(n - 1, Math.floor(Math.min(vis, 1) * (n - 1)));
        if (last < 1) continue;

        const ext = (s.side < 0 ? cx : w - cx) + 24;
        const pull = 1 + (1 - p) * 0.45;

        ctx.beginPath();
        for (let i = 0; i <= last; i++) {
          const d = ext * (1 - i / (n - 1));
          const sc = smooth((d - R) / (ext - R));
          const env = 0.12 + 0.88 * sc;
          const dn = d / ext;

          const th = s.k * dn * TAU + s.phase + t * s.w;
          const wave = Math.sin(th) + 0.14 * Math.sin(2 * th + s.phase);
          const x = cx + s.side * d;
          const y = cy + s.near * R * (1 - sc) + s.far * h * pull * sc + wave * s.amp * h * env;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const x0 = cx + s.side * ext;
        const x1 = x0 + (cx - x0) * 1.16;
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        const head = Math.min(1, vis / 1.16);
        const tail = Math.max(0, (vis - 0.16) / 1.16);
        g.addColorStop(0, `rgba(${s.rgb},0.9)`);
        g.addColorStop(tail, `rgba(${s.rgb},0.9)`);
        g.addColorStop(head, `rgba(${s.rgb},0)`);

        ctx.strokeStyle = g;
        ctx.shadowColor = `rgba(${s.rgb},0.65)`;
        ctx.shadowBlur = glow;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "destination-out";
      const f = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.9);
      f.addColorStop(0, "rgba(0,0,0,1)");
      f.addColorStop(0.12, "rgba(0,0,0,0.9)");
      f.addColorStop(0.5, "rgba(0,0,0,0.42)");
      f.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = f;
      ctx.fillRect(cx - R * 1.9, cy - R * 1.9, R * 3.8, R * 3.8);
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (now: number) => {
      if (!start) start = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        draw(2.4);
        return;
      }
      if (visible) raf = requestAnimationFrame(frame);
    };

    measure();
    play();

    const ro = new ResizeObserver(() => {
      measure();
      if (reduce.matches) draw(2.4);
    });
    ro.observe(canvas);
    ro.observe(orb);

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
  }, [orbRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}