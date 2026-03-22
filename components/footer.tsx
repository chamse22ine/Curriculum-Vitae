import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative py-8 sm:py-12 px-4 z-10">
            <div className="section-divider mb-8" />
            <div className="max-w-7xl mx-auto">
                <div className="relative flex items-center justify-between px-4">
                    <p className="text-muted-foreground text-left text-sm">
                        © 2025 Chamseddine Adaadour
                        <span className="hidden sm:inline"> — All Rights Reserved</span>
                    </p>
                    <Link href="/calculator" aria-label="Calculatrice">
                        <Button
                            size="lg"
                            variant="outline"
                            aria-label="Calculatrice"
                            className="bg-linear-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-500 hover:scale-105 font-medium px-3 sm:px-8 rounded-full border-none"
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
