"use client";
import { handleScroll } from "@/utils/HandleScroll";
import { Activity, ArrowUp, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";

type FooterLink = { label: string; href: string; external?: boolean };

const SITE_LINKS: FooterLink[] = [
    { label: "Demo", href: "#demo" },
    { label: "Features", href: "#features" },
    { label: "Setup", href: "#setup" },
    { label: "Architecture", href: "#architecture" },
    { label: "Docs", href: "#docs" },
];

const MEDIA_LINKS: FooterLink[] = [
    { label: "X", href: "https://x.com/elisey_ar", external: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/elisey-ar", external: true },
    { label: "Github", href: "https://github.com/gwill1337", external: true },
];

const LINK_CLASS =
    "group inline-flex min-h-11 items-center gap-1 rounded-sm text-[15px] text-neutral-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-9";

function Spread({ text, className = "" }: { text: string; className?: string }) {
    return (
        <span role="text" aria-label={text} className={`flex w-0 min-w-full justify-between ${className}`}>
            {[...text].map((ch, i) => (
                <span key={i} aria-hidden>
                    {ch === " " ? "\u00A0" : ch}
                </span>
            ))}
        </span>
    );
}

function NavGroup({ title, links, className = "" }: { title: string; links: FooterLink[]; className?: string }) {
    return (
        <div className={className}>
            <h3 className="font-mono text-sm text-neutral-500">// {title}</h3>
            <ul className="mt-3">
                {links.map((link) => (
                    <li key={link.label}>
                        {link.external ? (
                            <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                                {link.label}
                                <ArrowUpRight
                                    aria-hidden
                                    size={14}
                                    strokeWidth={1.5}
                                    className="text-neutral-600 transition-colors duration-200 group-hover:text-neutral-300"
                                />
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        ) : (
                            <a href={link.href} onClick={(e) => handleScroll(e, link.href)} className={LINK_CLASS}>
                                {link.label}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
    }
}

function Year() {
    return <>{new Date().getFullYear()}</>;
}

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:px-8 sm:pt-20">
                <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-3 text-4xl min-[360px]:text-5xl min-[420px]:text-6xl sm:gap-4 sm:text-8xl lg:text-7xl xl:text-9xl">
                        <Activity aria-hidden strokeWidth={1.3} className="size-[0.9em] shrink-0 text-white" />
                        <div className="flex flex-col">
                            <span className="-ml-1.5 font-syne text-[1em] font-extrabold uppercase leading-[0.8] text-neutral-50">
                                MONA
                            </span>
                            <Spread
                                text="by Elisey Ar"
                                className="mt-[0.1em] font-syne text-[0.3em] font-extrabold leading-none text-neutral-50"
                            />
                            <Spread
                                text="Fullstack and MVPs developer"
                                className="mt-3 font-mono text-[11px] leading-none text-neutral-400 sm:text-xs"
                            />
                        </div>
                    </div>

                    <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 sm:gap-x-16">
                        <NavGroup title="Content" links={SITE_LINKS} />
                        <NavGroup title="Media" links={MEDIA_LINKS} className="border-l border-white/10 pl-10 sm:pl-16" />
                    </nav>
                </div>

                <div className="mt-16 flex items-center justify-between border-t border-white/10 pt-6 font-mono text-xs text-neutral-500">
                    <p>© <Suspense fallback="2026">
                        <Year />
                    </Suspense> Elisey Ar
                    </p>
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="group -mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Back to top
                        <ArrowUp aria-hidden size={14} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </footer>
    );
}
