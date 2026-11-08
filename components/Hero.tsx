"use client";
import type { CSSProperties } from "react";
import { Activity, ArrowUpRight } from "lucide-react";
import { MotionConfig, motion, useReducedMotion, type Variants } from "motion/react";
import { HeroVisual } from "./hero-visual";
import Link from "next/link";

const DEMO_HREF = "/demo";

const TAGS = ["MCP",  "Self-hosted", "Monitor anything", "One-command deploy"];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

const listVariants: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.4, staggerChildren: 0.09 } },
};
const tagVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

const brandContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const brandItemVariants: Variants = {
  hidden: { opacity: 0, x: -24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE }
  },
};

function Brand() {
  const reduce = useReducedMotion();
  const text = "MONA";

  return (
    <motion.div
      className="relative z-10 mt-5 md:mt-20 flex items-center justify-center gap-2"
      variants={reduce ? undefined : brandContainerVariants}
      initial="hidden"
      animate="show"
    >

      <motion.div variants={brandItemVariants}>
        <Activity className="w-12 h-12 md:w-15 md:h-15" aria-hidden />
      </motion.div>

      <h2 className="flex font-syne text-4xl md:text-5xl font-bold">
        <span className="sr-only">{text}</span>
        {[...text].map((ch, i) => (
          <motion.span key={i} aria-hidden variants={brandItemVariants} className="inline-block">
            {ch}
          </motion.span>
        ))}
      </h2>
    </motion.div>
  );
}

function Word({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: 0.05 } } }}
    >
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <motion.span key={i} aria-hidden className="inline-block" variants={letterVariants}>
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

const heading = "font-syne text-[length:var(--h)] font-extrabold uppercase leading-[0.9]";
const MotionLink = motion.create(Link);

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative isolate h-svh min-h-[900px] overflow-hidden text-neutral-50 lg:min-h-[720px]"
        style={{ "--orb": "clamp(224px, 19vw, 400px)", "--h": "clamp(40px, 3.8vw, 80px)" } as CSSProperties}
      >
        <h1 className="sr-only">MONA: monitoring and analytics for any device</h1>

        <HeroVisual>
          <MotionLink
            {...rise(1.5)}
            href={DEMO_HREF}
            className="group inline-flex h-14 items-center gap-2 rounded-full bg-neutral-50 px-8 font-syne text-xl font-semibold text-neutral-950 transition-colors duration-200 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:h-16 lg:px-10 lg:text-2xl cursor-pointer"
          >
            Try in web
            <ArrowUpRight
              aria-hidden
              strokeWidth={1.5}
              className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 lg:size-6"
            />
          </MotionLink>
        </HeroVisual>

        <Brand />

        <motion.ul
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="absolute left-6 top-24 z-10 text-sm font-medium leading-6 text-neutral-100 sm:left-8 lg:top-[17%] lg:text-lg lg:leading-8 xl:text-xl"
        >
          {TAGS.map((tag) => (
            <motion.li key={tag} variants={tagVariants}>
              <span className="mr-1.5 text-neutral-500">//</span>
              {tag}
            </motion.li>
          ))}
        </motion.ul>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-10 px-6 pb-10 sm:px-8 lg:top-[58%] lg:flex-row lg:justify-between lg:pb-[12svh]">
          <div className="flex flex-col gap-4 lg:w-[calc(var(--h)_*_8.8)] lg:self-end">
            <motion.p {...rise(1.2)} className="max-w-[36rem] text-base text-neutral-300 lg:text-lg">
              Mona is a monitoring and analytics system that scrapes any device and detects anomalies
            </motion.p>
            <p className={heading}>
              <Word text="Monitor" delay={0.6} />
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:w-fit lg:self-start">
            <p className={heading}>
              <Word text="Analyze" delay={0.8} />
            </p>
            <motion.p
              {...rise(1.4)}
              className="max-w-[36rem] text-base text-neutral-300 lg:w-0 lg:min-w-full lg:max-w-none lg:text-lg"
            >
              Isolation Forest for anomaly detection, FastAPI for the backend, React for the frontend, Terraform,
              Kubernetes (kind) and Docker for infra
            </motion.p>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}