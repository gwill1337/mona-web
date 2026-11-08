"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Info, X } from "lucide-react";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function DemoModal({
  open,
  onClose,
  title = "Not available in the demo",
  children = "This feature is not available in the demo.",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}) {
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-neutral-950 p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-50 ${focusRing}`}
        >
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div className="flex gap-3 pr-8">
          <Info
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
            className="mt-1 shrink-0 text-neutral-400"
          />
          <div className="min-w-0 text-md leading-6 text-neutral-400">
            <h2 id={titleId} className="mb-0.5 font-medium text-neutral-50">
              {title}
            </h2>
            {children}
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className={`mt-6 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-white px-5 text-md font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 sm:w-auto ${focusRing}`}
        >
          Got it
        </button>
      </div>
    </div>
  );
}