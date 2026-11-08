"use client";
import { useId, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const VIEW = { once: true, margin: "-80px" } as const;

const SKY = "#38bdf8";
const INDIGO = "#7c6cff";
const VIOLET = "#b46cf5";
const TEAL = "#2dd4bf";
const CORAL = "#ff6b6b";

const W = 1200;
const H = 420;
const CY = H / 2;
const TOP = 60;
const BOTTOM = H - 60;
const COLS = 6;
const SPACING = W / COLS;
const S = 64;
const nodeX = (col: number) => SPACING * (col + 0.5);
const HUB = 3;

type Node = {
  role: string;
  name: string;
  text: string;
  facts: [string, string][];
  col: number;
  y: number;
  marker?: boolean;
};

const NODES: Node[] = [
  {
    role: "source",
    name: "Devices",
    text: "Any machine you want to watch runs node-exporter. Add it in values.yaml, or on the fly from the admin panel.",
    facts: [
      ["port", "9100"],
      ["add via", "values.yaml or admin panel"],
      ["api", "POST and DELETE /api/v1/devices"],
    ],
    col: 0,
    y: CY,
  },
  {
    role: "scrape",
    name: "Prometheus",
    text: "Scrapes the devices. Its target list comes from a dedicated FastAPI endpoint, so both ways of adding devices end up in one list.",
    facts: [
      ["targets", "/api/prometheus/targets"],
      ["auth", "none, on purpose"],
      ["instances", "devices, plus the cluster (Kubernetes only)"],
    ],
    col: 1,
    y: CY,
  },
  {
    role: "collect",
    name: "Celery workers",
    text: "Collect the scraped metrics and write them to PostgreSQL. ML runs as Celery tasks too, so the API stays responsive.",
    facts: [
      ["broker", "Redis"],
      ["tasks", "metrics collection, ML training and detection"],
      ["status", "/api/v1/task-status/{task_id}"],
    ],
    col: 2,
    y: CY,
  },
  {
    role: "store",
    name: "PostgreSQL",
    text: "The hub. Metrics go in, anomalies are written back, and everything else reads from here. Runs as a StatefulSet.",
    facts: [
      ["tables", "devices, metrics, anomalies, trained_models, users, api_keys"],
      ["api_keys", "belongs to the MCP server"],
      ["startup", "API and Celery pods wait for it via init containers"],
    ],
    col: HUB,
    y: CY,
  },
  {
    role: "detect",
    name: "Isolation Forest",
    text: "A Celery task reads recent metrics from PostgreSQL, scores them with scikit-learn and writes any anomalies back.",
    facts: [
      ["features", "metrics and their deltas"],
      ["contamination", "0.05"],
      ["score threshold", "-0.05"],
      ["combined anomalies", "ignored while CPU and RAM are under 80%"],
      ["auto", "latest 50–500 points, every 30 s by default"],
      ["manual", "your time range, model saved in PostgreSQL"],
    ],
    col: HUB,
    y: BOTTOM,
    marker: true,
  },
  {
    role: "serve",
    name: "FastAPI",
    text: "Returns data from PostgreSQL whenever an endpoint is called. The REST API sits behind cookie sessions.",
    facts: [
      ["session", "32-byte token, HttpOnly cookie, 12 h"],
      ["roles", "user: GET only. admin: all methods"],
      ["redis", "sessions, rate limiter, task status"],
      ["probes", "/health/live and /health/ready"],
    ],
    col: 4,
    y: CY,
  },
  {
    role: "show",
    name: "React UI",
    text: "Polls the API on an interval and assembles the dashboards from the responses.",
    facts: [
      ["pages", "dashboard, userboard, admin panel"],
      ["charts", "Recharts"],
    ],
    col: 5,
    y: CY,
  },
  {
    role: "ai tools",
    name: "MCP server",
    text: "Gives AI agents access to MONA. It sits outside the chain: most tools query PostgreSQL directly, a few go through Celery and Redis or the backend's HTTP API.",
    facts: [
      ["postgresql, directly", "9 tools: devices, metrics, anomalies and models, via SQLAlchemy"],
      ["celery and redis", "2 tools: train_anomaly_model, get_task_status"],
      ["fastapi, over http", "2 tools: get_mona_health, get_prometheus_targets"],
      ["prompts", "diagnose_mona, investigate_anomaly"],
      ["resources", "mona://docs/overview and mona://docs/metrics, static text bundled in the code"],
      ["api_keys", "a table in PostgreSQL, used by the MCP server"],
    ],
    col: HUB,
    y: TOP,
  },
];
const DETECTOR = NODES.findIndex((n) => n.marker);

function wave(o: number, k: number, ph: number, x0: number, x1: number) {
  const pts: string[] = [];
  for (let x = x0; x <= x1 + 0.01; x += 8) {
    const u = (x - SPACING / 2) / SPACING;
    const t = u - Math.floor(u);
    const y = CY + o * S * Math.sin(Math.PI * t) * (1 + 0.22 * Math.sin(2 * Math.PI * k * t + ph));
    pts.push(`${pts.length ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join("");
}

function lens(x: number, y0: number, y1: number, o: number, amp: number, ph: number) {
  const n = 24;
  const pts: string[] = [];
  for (let s = 0; s <= n; s++) {
    const t = s / n;
    const px = x + o * amp * Math.sin(Math.PI * t) * (1 + 0.22 * Math.sin(2 * Math.PI * t + ph));
    pts.push(`${s ? "L" : "M"}${px.toFixed(1)} ${(y0 + (y1 - y0) * t).toFixed(1)}`);
  }
  return pts.join("");
}

const LINES = [
  { c: SKY, rgb: "56,189,248", o: -1, k: 1, ph: 0 },
  { c: INDIGO, rgb: "124,108,255", o: -0.45, k: 2, ph: 1.2 },
  { c: VIOLET, rgb: "180,108,245", o: 0.45, k: 1, ph: 2.4 },
  { c: TEAL, rgb: "45,212,191", o: 1, k: 2, ph: 3.6 },
].map((l) => ({ ...l, d: wave(l.o, l.k, l.ph, 0, W) }));

const HX = nodeX(HUB);
const SERVED = wave(-0.8, 1, 0.6, HX, W);
const CORAL_BACK = lens(HX, BOTTOM, CY, 1, 20, 0.6);
const SKY_DOWN = lens(HX, CY, BOTTOM, -1, 20, 0);
const MCP = [lens(HX, CY, TOP, -0.7, 20, 1), lens(HX, CY, TOP, 0.7, 20, 2.4)];

function Facts({ facts }: { facts: [string, string][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt className="font-mono text-xs text-neutral-500">{k}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-neutral-200">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Draw({ d, c, rgb, delay, duration = 1.4 }: { d: string; c: string; rgb: string; delay: number; duration?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={c}
      strokeWidth={1.5}
      strokeOpacity={0.88}
      style={{ filter: `drop-shadow(0 0 5px rgba(${rgb},0.45))` }}
      initial={reduce ? false : { pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={VIEW}
      transition={{ duration, ease: EASE, delay }}
    />
  );
}

function Diagram() {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const [active, setActive] = useState(DETECTOR);
  const node = NODES[active] ?? NODES[DETECTOR]!;
  const coralRgb = "255,107,107";

  return (
    <div className="hidden lg:block">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.07" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.93" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <rect width={W} height={H} fill={`url(#${id}-g)`} />
            </mask>
          </defs>

          <g mask={`url(#${id}-m)`}>
            <line x1="0" x2={W} y1={CY} y2={CY} stroke="rgba(255,255,255,0.08)" />

            {LINES.map((l, i) => (
              <Draw key={l.c} d={l.d} c={l.c} rgb={l.rgb} delay={0.1 * i} duration={1.8} />
            ))}

            {MCP.map((d, i) => (
              <Draw key={i} d={d} c={VIOLET} rgb="180,108,245" delay={0.9} />
            ))}
            <Draw d={SKY_DOWN} c={SKY} rgb="56,189,248" delay={1.0} />
            <Draw d={CORAL_BACK} c={CORAL} rgb={coralRgb} delay={1.6} />
            <Draw d={SERVED} c={CORAL} rgb={coralRgb} delay={2.0} duration={1.2} />

            {!reduce &&
              LINES.slice(0, 2).map((l, i) => (
                <circle key={l.c} r="2.5" fill={l.c}>
                  <animateMotion dur={`${10 + i * 4}s`} begin={`${2.5 + i * 3}s`} repeatCount="indefinite" path={l.d} />
                </circle>
              ))}
          </g>
        </svg>

        <div className="absolute inset-0">
          {NODES.map((n, i) => (
            <button
              key={n.name}
              type="button"
              aria-pressed={active === i}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ left: `${((n.col + 0.5) / COLS) * 100}%`, top: `${(n.y / H) * 100}%` }}
              className={`absolute w-[14%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg border bg-neutral-950 p-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                active === i ? "border-white/40" : "border-white/10 hover:border-white/25"
              }`}
            >
              {n.marker && (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1.5 size-3 rotate-45 bg-[#ff6b6b] shadow-[0_0_10px_rgba(255,107,107,0.7)]"
                />
              )}
              <span className="font-mono text-xs text-neutral-500">{n.role}</span>
              <span className="mt-1.5 block text-sm font-medium leading-tight text-neutral-100">{n.name}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={node.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        aria-live="polite"
        className="grid min-h-72 gap-8 border-t border-white/10 p-8 lg:grid-cols-3"
      >
        <div>
          <p className="font-mono text-sm text-neutral-600">// {node.role}</p>
          <h3 className="mt-4 font-syne text-2xl font-bold leading-tight text-neutral-50">{node.name}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">{node.text}</p>
        </div>
        <div className="lg:col-span-2">
          <Facts facts={node.facts} />
        </div>
      </motion.div>
    </div>
  );
}

function List() {
  return (
    <ol className="divide-y divide-white/10 lg:hidden">
      {NODES.map((n) => (
        <li key={n.name} className="p-6">
          <p className="flex items-center gap-3 font-mono text-sm text-neutral-600">
            // {n.role}
            {n.marker && <span aria-hidden className="size-2 rotate-45 bg-[#ff6b6b] shadow-[0_0_8px_rgba(255,107,107,0.7)]" />}
          </p>
          <h3 className="mt-3 font-syne text-xl font-bold leading-tight text-neutral-50">{n.name}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-400">{n.text}</p>
          <div className="mt-5">
            <Facts facts={n.facts} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ArchitectureSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section id="architecture" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12 sm:mb-16"
        >
          <p className="font-mono text-sm text-neutral-500">// Architecture</p>
          <h2 className="mt-4 max-w-[16ch] font-syne text-[clamp(32px,3.8vw,64px)] font-extrabold uppercase leading-[0.95] text-neutral-50">
            From device to dashboard
          </h2>
          <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-neutral-400">
            A metric travels from the machine to the screen. PostgreSQL is the hub: everything either writes to it or
            reads from it.
            <span className="hidden lg:inline"> Hover a node to see what runs there.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.8, ease: EASE }}
          className="overflow-hidden rounded-xl border border-white/10 bg-white/2"
        >
          <Diagram />
          <List />
        </motion.div>

        <p className="mt-4 font-mono text-xs text-neutral-500">
          runs on kind, Terraform and Helm, or Docker Compose without Grafana, Loki and Alertmanager
        </p>
      </section>
    </MotionConfig>
  );
}