"use client";

import { useRef, type ReactNode } from "react";
import { Orb } from "./orb";
import { Stripes } from "./stripes";

export function HeroVisual({ children }: { children?: ReactNode }) {
  const orbRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Stripes orbRef={orbRef} />
      <div
        className="absolute left-1/2 top-[40%] z-25 flex flex-col items-center gap-8 lg:top-[44%]"
        style={{ transform: "translate(-50%, calc(var(--orb) / -2))" }}
      >
        <div
          ref={orbRef}
          className="orb-in relative size-(--orb) rounded-full bg-[radial-gradient(circle_at_35%_30%,#1d1d21,#0a0a0b_72%)] ring-1 ring-inset ring-white/10"
        >
          <Orb />
        </div>
        {children}
      </div>
    </>
  );
}