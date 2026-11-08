"use client"
import { handleScroll } from "@/utils/HandleScroll";
import { Activity, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Setup", href: "#setup" },
    { label: "Architecture", href: "#architecture" },
];

export interface HeaderClickProps {
    e: React.MouseEvent<HTMLAnchorElement>;
    href: string;
};

export function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const handleOutsideClick = (e: PointerEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
        };
    }, []);

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (window.location.hash) {
                window.history.replaceState(null, "", window.location.pathname);
            }
        }
    };

    return (
        <header ref={menuRef} className="py-1 sticky top-0 z-50 w-full bg-[#050505]/40 backdrop-blur-md shadow-md">
            <div className="flex justify-between mx-6 mt-3 py-1">
                <Link
                    href={"/"}
                    onClick={handleLogoClick}
                    className="flex items-center gap-1 text-white cursor-pointer">
                    <Activity size={35} />
                    <h1 className="text-2xl font-bold font-syne transition duration-300 hover:translate-y-1">MONA</h1>
                </Link>
                <div className="flex gap-4 text-xl font-semibold font-syne">
                    <nav className="hidden md:flex gap-4 text-xl font-semibold font-syne">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={`/${link.href}`}
                                onClick={(e) => {
                                    if (pathname === "/") {
                                        e.preventDefault();
                                        handleScroll(e, link.href);
                                    }
                                }}
                                className="transition duration-300 hover:translate-y-1 text-gray-300 hover:text-white cursor-pointer"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href={"/demo/docs"} className="transition duration-300 hover:translate-y-1 text-gray-300 hover:text-white cursor-pointer">
                            Docs
                        </Link>
                    </nav>
                </div>
                <div className="flex text-xl font-semibold font-syne">
                    <a
                        className="hidden md:block transition duration-300 hover:translate-y-1 text-gray-300 hover:text-white cursor-pointer"
                        href="https://github.com/gwill1337/MONA"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Github
                    </a>
                    <button
                        className="transition duration-300 hover:translate-y-1 text-gray-300 hover:text-white cursor-pointer md:hidden z-20"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Menu"
                        aria-expanded={open}
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>
            {open && (
                <>
                    <div className="fixed inset-0 md:hidden" onClick={() => setOpen(false)} />
                    <nav className="md:hidden absolute right-3 top-full mt-2 w-44 rounded-xl border border-zinc-500 bg-black/90 backdrop-blur-3xl p-2">
                        <nav className="flex flex-col items-start gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={`/${link.href}`}
                                    onClick={(e) => {
                                        setOpen(false);
                                        if (pathname === "/") {
                                            e.preventDefault();
                                            handleScroll(e, link.href);
                                        }
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg text-base font-medium text-foreground hover:text-primary hover:bg-black/10 dark:hover:bg-white/10 transition font-syne"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <a
                            href="https://github.com/gwill1337/MONA"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-foreground hover:text-primary hover:bg-black/10 dark:hover:bg-white/10 transition font-syne"
                        >
                            GitHub
                        </a>
                    </nav>
                </>
            )}
        </header>
    );
}