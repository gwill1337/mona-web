"use client";
import { useState, type ReactNode } from "react";
import { Check, Copy, Info } from "lucide-react";
import { MotionConfig, motion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const VIEW = { once: true, margin: "-80px" } as const;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export function CodeBlock({ code, lang, title }: { code: string; lang: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <div className="flex h-10 items-center justify-between border-b border-white/10 bg-white/2 pl-4 pr-2">
        <span className="truncate font-mono text-xs text-neutral-400">{title ?? lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs text-neutral-400 transition-colors hover:bg-white/10 hover:text-white ${focusRing}`}
        >
          {copied ? <Check size={14} strokeWidth={1.5} aria-hidden /> : <Copy size={14} strokeWidth={1.5} aria-hidden />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre tabIndex={0} className={`overflow-x-auto p-4 font-mono text-[13px] leading-6 whitespace-pre text-neutral-200 ${focusRing}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/2 p-4">
      <Info size={16} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0 text-neutral-400" />
      <div className="min-w-0 text-sm leading-6 text-neutral-400">
        {title && <p className="mb-0.5 font-medium text-white">{title}</p>}
        {children}
      </div>
    </div>
  );
}


const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-neutral-100 wrap-anywhere">{children}</code>
);

const CLONE = "git clone https://github.com/gwill1337/MONA.git\ncd MONA";

type Method = {
  steps: ReactNode[];
  blocks: { title: string; lang: string; code: string }[];
  note: { title: string; text: ReactNode };
};

const METHODS: Record<"terraform" | "compose", Method> = {
  terraform: {
    steps: [
      "Install Docker Desktop, kind, helm and Terraform",
      "Run node exporter on every device you want to monitor (port 9100)",
      "Clone the repository",
      <>
        Copy <C>terraform/terraform.tfvars.example</C> to <C>terraform/terraform.tfvars</C> and fill in the required
        accounts and passwords
      </>,
      "Deploy with the script for your OS",
    ],
    blocks: [
      { title: "Clone repository", lang: "bash", code: CLONE },
      { title: "Windows (PowerShell)", lang: "powershell", code: String.raw`.\deploy.ps1 -all # or .\deploy.ps1 -deploy` },
      { title: "Linux and macOS", lang: "bash", code: "make all" },
    ],
    note: {
      title: "After changing code",
      text: (
        <>
          Images are built locally as <C>mona-*:local</C> and loaded into the kind cluster on every apply. Run build
          first, then deploy.
        </>
      ),
    },
  },
  compose: {
    steps: [
      "Install Docker Desktop",
      "Run node exporter on every device you want to monitor (port 9100)",
      "Clone the repository",
      <>
        Copy <C>.env.example</C> to <C>.env</C> and configure database and admin credentials
      </>,
      "Start the stack via docker compose",
    ],
    blocks: [
      { title: "Clone repository", lang: "bash", code: CLONE },
      {
        title: "Start production stack",
        lang: "bash",
        code: "docker compose -p mona-prod --env-file .env -f docker-compose.prod.yml up -d --build",
      },
      { title: "Stop stack", lang: "bash", code: "docker compose -p mona-prod -f docker-compose.prod.yml down" },
    ],
    note: {
      title: "No Grafana in Compose",
      text: "Compose has no Grafana, Loki, Alertmanager or cluster Prometheus. Device monitoring and anomaly detection work the same.",
    },
  },
};

const TABS = [
  { id: "terraform", label: "Terraform & Helm" },
  { id: "compose", label: "Docker Compose" },
] as const;


export function SetupSection() {
  const [method, setMethod] = useState<keyof typeof METHODS>("terraform");
  const m = METHODS[method];

  return (
    <MotionConfig reducedMotion="user">
      <section id="setup" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="font-mono text-sm text-neutral-500">// Setup</p>
          <h2 className="mt-4 max-w-[16ch] font-syne text-[clamp(32px,3.8vw,64px)] font-extrabold uppercase leading-[0.95] text-neutral-50">
            Deployment
          </h2>
          <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-neutral-400">
            MONA runs in two ways. Both give you the same API, Celery workers and web UI. They differ in the monitoring
            stack around them.
          </p>

          <div role="group" aria-label="Deployment method" className="mt-8 inline-flex rounded-lg border border-white/10 p-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={method === t.id}
                onClick={() => setMethod(t.id)}
                className={`cursor-pointer rounded-md px-4 py-2 text-sm transition-colors duration-200 ${focusRing} ${method === t.id ? "bg-white/10 text-neutral-50" : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={method}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-10 grid gap-4 lg:grid-cols-3"
        >
          <div className="rounded-xl border border-white/10 bg-white/2 p-6 lg:p-8">
            <h3 className="font-syne text-2xl font-bold leading-tight text-neutral-50">Requirements &amp; steps</h3>
            <ol className="mt-6 space-y-4">
              {m.steps.map((s, i) => (
                <li key={i} className="flex gap-4 text-[15px] leading-relaxed text-neutral-300">
                  <span className="w-6 shrink-0 font-mono text-sm text-neutral-600">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-2">
            {m.blocks.map((b) => (
              <CodeBlock key={b.title} {...b} />
            ))}
            <Callout title={m.note.title}>{m.note.text}</Callout>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}