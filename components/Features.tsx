"use client";
import { Fragment, useState, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const VIEW = { once: true, margin: "-80px" } as const;

const SKY = "#38bdf8";
const CORAL = "#ff6b6b";


function Card({
  n,
  title,
  text,
  delay = 0,
  className = "",
  children,
}: {
  n: string;
  title: string;
  text: string;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={`flex flex-col rounded-xl border border-white/10 bg-white/2 p-6 transition-colors duration-200 hover:border-white/20 lg:p-8 ${className}`}
    >
      <span className="font-mono text-sm text-neutral-600">// {n}</span>
      <h3 className="mt-6 font-syne text-2xl font-bold leading-tight text-neutral-50">{title}</h3>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-neutral-400">{text}</p>
      <div className="mt-auto pt-8">{children}</div>
    </motion.article>
  );
}

const N = 64;
const SPIKE = 44;
const SERIES = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: N }, (_, i) =>
    i === SPIKE ? 16 : 88 + Math.sin(i / 5) * 12 + Math.sin(i / 2.3) * 5 + (rnd() - 0.5) * 7,
  );
})();
const X = (i: number) => (i / (N - 1)) * 600;
const PATH = SERIES.map((y, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${y.toFixed(1)}`).join("");

const MODES = {
  auto: "Last 50–500 points, retrained before every detection (every 30 s by default). The model is not stored.",
  manual: "Trains on a time range you pick. The trained model is saved in PostgreSQL.",
} as const;

function AnomalyChart() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<keyof typeof MODES>("auto");

  return (
    <div>
      <div className="relative">
        <svg viewBox="0 0 600 140" className="h-auto w-full" role="img" aria-label="Metric series with one detected anomaly">
          {[35, 70, 105].map((y) => (
            <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
          ))}
          <motion.path
            d={PATH}
            fill="none"
            stroke={SKY}
            strokeWidth={2}
            strokeLinejoin="miter"
            style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.45))" }}
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={VIEW}
            transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
          />
          <motion.g
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEW}
            transition={{ duration: 0.5, ease: EASE, delay: 1.4 }}
          >
            <line x1={X(SPIKE)} x2={X(SPIKE)} y1={16} y2={140} stroke={CORAL} strokeOpacity={0.4} strokeDasharray="3 4" />
            <polygon
              points={`${X(SPIKE)},9 ${X(SPIKE) + 7},16 ${X(SPIKE)},23 ${X(SPIKE) - 7},16`}
              fill={CORAL}
              style={{ filter: "drop-shadow(0 0 6px rgba(255,107,107,0.7))" }}
            />
          </motion.g>
        </svg>
        <motion.span
          className="absolute -translate-y-1/2 pl-4 font-mono text-xs text-[#ff6b6b]"
          style={{ left: `${(X(SPIKE) / 600) * 100}%`, top: `${(16 / 140) * 100}%` }}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEW}
          transition={{ duration: 0.5, ease: EASE, delay: 1.5 }}
        >
          anomaly
        </motion.span>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        <div role="group" aria-label="Detection mode" className="inline-flex shrink-0 self-start rounded-lg border border-white/10 p-0.5">
          {(Object.keys(MODES) as (keyof typeof MODES)[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-2 text-sm capitalize transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white ${
                mode === m ? "bg-white/10 text-neutral-50" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-sm leading-relaxed text-neutral-400">
          {MODES[mode]}
        </p>
      </div>
    </div>
  );
}

function Typed({ text, delay }: { text: string; delay: number }) {
  const reduce = useReducedMotion();
  const steps = (t: number) => Math.floor(t * text.length) / text.length;
  return (
    <motion.span
      className="inline-block whitespace-nowrap"
      initial={reduce ? false : { clipPath: "inset(-10% 100% -10% 0)" }}
      whileInView={{ clipPath: "inset(-10% -2% -10% 0)" }}
      viewport={VIEW}
      transition={{ duration: 0.05 * text.length, ease: steps, delay }}
    >
      {text}
    </motion.span>
  );
}

function Terminal() {
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm text-neutral-100">
      <div className="flex items-baseline gap-2">
        <span className="text-neutral-600">$</span>
        <Typed text="make all" delay={0.5} />
        <span className="ml-auto text-xs text-neutral-600">Linux, macOS</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-neutral-600">&gt;</span>
        <Typed text={".\\deploy.ps1 -all"} delay={1.1} />
        <span className="ml-auto text-xs text-neutral-600">Windows</span>
      </div>
    </div>
  );
}

const METHODS = ["GET", "POST", "PUT", "DELETE"];
const ROLES = [
  { role: "admin", allowed: [true, true, true, true] },
  { role: "user", allowed: [true, false, false, false] },
];

function Permissions() {
  return (
    <div>
      <div className="grid grid-cols-[auto_repeat(4,1fr)] items-center gap-y-3 font-mono text-xs">
        <span />
        {METHODS.map((m) => (
          <span key={m} className="text-neutral-500">
            {m}
          </span>
        ))}
        {ROLES.map((r) => (
          <Fragment key={r.role}>
            <span className="pr-6 text-sm text-neutral-200">{r.role}</span>
            {r.allowed.map((ok, i) => (
              <span key={i} className={`size-2.5 ${ok ? "bg-neutral-100" : "border border-neutral-700"}`}>
                <span className="sr-only">{ok ? "allowed" : "denied"}</span>
              </span>
            ))}
          </Fragment>
        ))}
      </div>
      <p className="mt-6 font-mono text-xs text-neutral-500">
        401 no session <span className="px-1 text-neutral-700">/</span> 403 role not allowed
      </p>
    </div>
  );
}

const STACK = [
  { label: "metrics", names: ["Prometheus"] },
  { label: "dashboards", names: ["Grafana", "React + Recharts"] },
  { label: "logs", names: ["Loki", "Promtail"] },
  { label: "alerts", names: ["Alertmanager"] },
];

function Stack() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STACK.map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 p-4">
            <p className="font-mono text-xs text-neutral-500">{s.label}</p>
            <p className="mt-3 space-y-0.5 text-sm text-neutral-100">
              {s.names.map((n) => (
                <span key={n} className="block">
                  {n}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-neutral-500">The Docker Compose setup runs without Grafana, Loki and Alertmanager</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12 sm:mb-16"
        >
          <p className="font-mono text-sm text-neutral-500">// Features</p>
          <h2 className="mt-4 max-w-[16ch] font-syne text-[clamp(32px,3.8vw,64px)] font-extrabold uppercase leading-[0.95] text-neutral-50">
            Metrics in, anomalies out
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card
            n="01"
            title="Anomaly detection"
            text="Isolation Forest on delta features. A score threshold, plus a rule that ignores combined anomalies while CPU and RAM stay under 80%, keeps false positives down."
            className="md:col-span-2"
          >
            <AnomalyChart />
          </Card>

          <Card
            n="02"
            title="One-command deploy"
            text="Terraform and Helm bring up a kind cluster. Init containers hold the API and workers until Postgres is ready, and probes report liveness and readiness."
            delay={0.08}
          >
            <Terminal />
          </Card>

          <Card
            n="03"
            title="Role-based access"
            text="Cookie sessions backed by Redis: a cryptographically secure 32-byte token in an HttpOnly cookie, valid for 12 hours."
          >
            <Permissions />
          </Card>

          <Card
            n="04"
            title="Observability stack"
            text="Prometheus scrapes your devices and the cluster. Grafana and the built-in React dashboards show it, Loki and Promtail collect pod logs, Alertmanager sends pod alerts."
            delay={0.08}
            className="md:col-span-2"
          >
            <Stack />
          </Card>
        </div>
      </section>
    </MotionConfig>
  );
}