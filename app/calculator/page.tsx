import LCeRCalculator from "@/components/moyenne";
import MasterCalculator from "@/components/master-calculator";
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"

const CURSUS = {
    licence: { label: "Licence", title: "Licence Informatique", description: "L1, L2 et L3 — compétences UE1 à UE5", badge: "L" },
    master: { label: "Master", title: "Master Informatique", description: "M1 ILI / ILJ — blocs C1 à C4, M3C 2026-2027", badge: "M" },
} as const

type Cursus = keyof typeof CURSUS

const CURSUS_KEYS = Object.keys(CURSUS) as Cursus[]

function isCursus(value: string | undefined): value is Cursus {
    return CURSUS_KEYS.includes(value as Cursus)
}

function CursusChooser() {
    return (
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calculateur de moyenne</h1>
                <p className="text-sm text-muted-foreground mt-2">Choisis ta formation pour commencer</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CURSUS_KEYS.map((key) => (
                    <Link
                        key={key}
                        href={`/calculator?cursus=${key}`}
                        className="group glass-card rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{CURSUS[key].badge}</span>
                        </div>
                        <div>
                            <p className="font-bold text-foreground">{CURSUS[key].title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{CURSUS[key].description}</p>
                        </div>
                        <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                            Choisir
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ cursus?: string }> }) {
    const { cursus: param } = await searchParams
    const cursus = isCursus(param) ? param : null

    return (
        <main className="min-h-screen bg-background">
            {/* Decorative background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
            </div>

            <div className="relative z-10">
                {/* Sticky header */}
                <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground transition-colors gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        </Link>
                        {cursus && (
                            <nav className="glass-card p-1 inline-flex rounded-lg" aria-label="Formation">
                                {CURSUS_KEYS.map((key) => (
                                    <Link
                                        key={key}
                                        href={`/calculator?cursus=${key}`}
                                        aria-current={key === cursus ? "page" : undefined}
                                        className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-md transition-all duration-300 ${key === cursus ? "bg-linear-to-r from-primary to-accent text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {CURSUS[key].label}
                                    </Link>
                                ))}
                            </nav>
                        )}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-foreground leading-tight">Calculateur de Moyenne</p>
                                <p className="text-xs text-muted-foreground leading-tight">{cursus ? CURSUS[cursus].title : "Licence ou Master"}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {cursus === "licence" && <LCeRCalculator />}
                {cursus === "master" && <MasterCalculator />}
                {!cursus && <CursusChooser />}
            </div>
        </main>
    )
}
