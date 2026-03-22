"use client"

import LCeRCalculator from "@/components/moyenne";
import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function CalculatorPage() {
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
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
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
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-foreground leading-tight">Calculateur de Moyenne</p>
                                <p className="text-xs text-muted-foreground leading-tight">Licence Informatique</p>
                            </div>
                        </div>
                    </div>
                </header>

                <LCeRCalculator />
            </div>
        </main>
    )
}
