import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const LINKS = [
    { href: "/#skills", label: "Skills" },
    { href: "/#projects", label: "Projects" },
    { href: "/#contact", label: "Contact" },
]

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                <Link href="/" className="font-display text-2xl leading-none text-ink">
                    Chams<span className="text-primary">.</span>
                </Link>
                <nav aria-label="Main" className="flex items-center gap-1">
                    {LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="hidden rounded-md px-3 py-2 text-ui text-ink-soft transition-colors duration-100 ease-out-ui hover:text-ink md:inline-flex"
                        >
                            {link.label}
                        </a>
                    ))}
                    <Link
                        href="/calculator"
                        className="inline-flex h-9 items-center rounded-md px-3 text-ui font-medium text-primary transition-colors duration-100 ease-out-ui hover:bg-surface-sunk"
                    >
                        Calculator
                    </Link>
                    <ThemeToggle label="Toggle light and dark mode" />
                </nav>
            </div>
        </header>
    )
}
