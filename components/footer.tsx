import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative py-8 sm:py-12 px-4 z-10 border-t border-primary/20">
            <div className="max-w-7xl mx-auto">
                <div className="relative flex items-center justify-between px-4">
                    <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary blur-xl opacity-20 rounded-md" />
                    <p className="relative z-10 text-muted-foreground text-left">
                        © 2025 Chamseddine Adaadour
                        <span className="hidden sm:inline"> — All Rights Reserved</span>
                    </p>
                    <Link href="/calculator" aria-label="Calculatrice">
                        <Button
                            size="lg"
                            variant="outline"
                            aria-label="Calculatrice"
                            className="relative z-10 neon-glow-violet hover:neon-glow-cyan transition-all duration-300 hover:bg-primary bg-secondary hover:text-black text-white font-medium px-3 sm:px-8"
                        >
                            <Calculator className="h-5 w-5" />
                            <span className="hidden sm:inline ml-2">Calculatrice</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
