"use client"

import LCeRCalculator from "@/components/moyenne";
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CalculatorPage() {
    return (
        <main>
            <Link href="/">
                <Button
                    variant="outline"
                    className="m-4 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 bg-transparent"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l&apos;accueil
                </Button>
            </Link>
            <div className="glass-card p-2 rounded-2xl border border-primary/20">
                <LCeRCalculator />
            </div>

        </main>
    )
}
