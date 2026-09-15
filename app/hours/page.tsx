import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import HeuresAlternance from "@/components/heures-alternance"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
    title: "Heures d'alternance",
    description: "Calendrier des heures d'alternance : entreprise, cours et BU, lissées sur le mois.",
}

export default function HoursPage() {
    return (
        <main className="min-h-dvh">
            <header className="sticky top-0 z-40 border-b border-hairline bg-paper">
                <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-ui text-ink-muted transition-colors duration-100 ease-out-ui hover:bg-surface-sunk hover:text-ink"
                        >
                            <ArrowLeft className="size-4" aria-hidden />
                            Retour
                        </Link>
                        <span className="hidden font-display text-xl leading-none text-ink md:inline">Heures</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <HeuresAlternance />
        </main>
    )
}
