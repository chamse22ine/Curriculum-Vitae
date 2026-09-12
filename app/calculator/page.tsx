import LCeRCalculator from "@/components/moyenne";
import MasterCalculator from "@/components/master-calculator";
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const CURSUS = {
    licence: { label: "Licence", title: "Licence Informatique", description: "L1, L2 et L3 · compétences UE1 à UE5", badge: "L1 · L2 · L3" },
    master: { label: "Master", title: "Master Informatique", description: "Parcours ILI et ILJ · blocs C1 à C4, M3C 2026-2027", badge: "M1" },
} as const

type Cursus = keyof typeof CURSUS

const CURSUS_KEYS = Object.keys(CURSUS) as Cursus[]

function isCursus(value: string | undefined): value is Cursus {
    return CURSUS_KEYS.includes(value as Cursus)
}

function CursusChooser() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Université d&apos;Artois · Informatique</p>
            <h1 className="mt-3 font-display text-[2.5rem] leading-[1.05] text-ink sm:text-h1">Calculateur de moyenne</h1>
            <p className="mt-4 text-lead text-ink-soft">Choisis ta formation pour commencer. Tes notes restent dans ton navigateur.</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {CURSUS_KEYS.map((key) => (
                    <li key={key}>
                        <Link
                            href={`/calculator?cursus=${key}`}
                            className="group flex h-full flex-col rounded-lg border border-hairline bg-surface p-6 shadow-raise transition-colors duration-100 ease-out-ui hover:border-primary"
                        >
                            <p className="num text-caption font-semibold uppercase text-primary">{CURSUS[key].badge}</p>
                            <p className="mt-3 text-lg font-medium text-ink">{CURSUS[key].title}</p>
                            <p className="mt-1 text-ui text-ink-muted">{CURSUS[key].description}</p>
                            <span className="mt-6 inline-flex items-center gap-1.5 text-ui font-medium text-accent">
                                Choisir
                                <ArrowRight className="size-4 transition-transform duration-100 ease-out-ui group-hover:translate-x-0.5" aria-hidden />
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ cursus?: string }> }) {
    const { cursus: param } = await searchParams
    const cursus = isCursus(param) ? param : null

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
                        <span className="hidden font-display text-xl leading-none text-ink md:inline">Calculateur</span>
                    </div>
                    {cursus && (
                        <nav aria-label="Formation" className="inline-flex rounded-md bg-surface-sunk p-1">
                            {CURSUS_KEYS.map((key) => (
                                <Link
                                    key={key}
                                    href={`/calculator?cursus=${key}`}
                                    aria-current={key === cursus ? "page" : undefined}
                                    className={`inline-flex h-8 items-center rounded-sm px-3 text-ui transition-colors duration-100 ease-out-ui ${key === cursus ? "bg-surface text-ink shadow-raise" : "text-ink-muted hover:text-ink"}`}
                                >
                                    {CURSUS[key].label}
                                </Link>
                            ))}
                        </nav>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            {cursus === "licence" && <LCeRCalculator />}
            {cursus === "master" && <MasterCalculator />}
            {!cursus && <CursusChooser />}
        </main>
    )
}
